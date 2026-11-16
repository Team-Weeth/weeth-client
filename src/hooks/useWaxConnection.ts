'use client';

import { useEffect, useRef, useState } from 'react';
import type { WaxCommand, WaxEmoteKind, WaxLayout, WaxState, WaxWelcome } from '@/types/wax';

type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  /** 입력이 없어 서버가 내보냈다. 자동 재접속하지 않는다. */
  | 'idle'
  | 'error';

const MOVE_INTERVAL_MS = 80;
const PRESS_REPEAT_MS = 400;
const HEARTBEAT_MS = 10000;
/** 재접속 대기 시간. 배포(blue/green) 중에는 새 서버가 이미 떠 있어 첫 시도에 붙는 경우가 많다. */
const RECONNECT_DELAYS_MS = [800, 1500, 3000, 5000, 8000, 8000, 8000];
/** 서버가 welcome에 내보내기 시간을 주지 않을 때의 기본값(서버 기본 `weeth.wax.idle-timeout-ms`와 같다). */
const DEFAULT_IDLE_TIMEOUT_MS = 300_000;
/** 둘러보기처럼 서버 명령이 없는 입력은 이 간격마다 한 번만 알린다. */
const ACTIVE_REPORT_MS = 10_000;

/** 서버는 기본값(null·false)인 필드를 생략해 보낸다. 화면 코드가 늘 같은 모양을 받도록 채운다. */
function normalize(state: WaxState): WaxState {
  return {
    ...state,
    players: state.players.map((player) => ({
      ...player,
      seat: player.seat ?? null,
      pressing: player.pressing ?? false,
      emote: player.emote ?? null,
    })),
  };
}

export function useWaxConnection() {
  const [state, setState] = useState<WaxState | null>(null);
  const [welcome, setWelcome] = useState<WaxWelcome | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState('');
  /** 입장 거절 사유 코드(world_full 등). 화면이 코드별로 다른 버튼을 보여준다. */
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  /** 3D 장면은 매 프레임 이 ref를 읽는다. React 상태는 HUD용이다. */
  const latest = useRef<WaxState | null>(null);
  const held = useRef(false);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMove = useRef({ at: 0, x: NaN, z: NaN, yaw: NaN });
  /** 끊긴 뒤 다시 들어갈 월드와 시도 횟수. 입장(welcome)에 성공한 적이 있을 때만 자동 재접속한다. */
  const reconnect = useRef<{ worldId: string | null; attempt: number } | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 서버가 플레이 입력으로 본 마지막 시각(Date.now). heartbeat를 뺀 모든 명령이 갱신한다. 내보내기 경고 계산에 쓴다. */
  const lastActiveAt = useRef(0);

  function send(command: WaxCommand) {
    if (socket.current?.readyState !== WebSocket.OPEN) return;
    socket.current.send(JSON.stringify(command));
    if (command.type !== 'heartbeat') lastActiveAt.current = Date.now();
  }

  /** 화면 입력(키·마우스·터치)이 있을 때 부른다. 마지막 알림 뒤 10초가 지났을 때만 서버에 알린다. */
  function reportActivity() {
    if (Date.now() - lastActiveAt.current >= ACTIVE_REPORT_MS) send({ type: 'active' });
  }

  function stopPress() {
    if (held.current) send({ type: 'press', active: false });
    held.current = false;
    if (repeat.current) clearInterval(repeat.current);
    repeat.current = null;
    setPressing(false);
  }

  function startPress() {
    if (
      held.current ||
      latest.current?.you.status !== 'seated' ||
      socket.current?.readyState !== WebSocket.OPEN
    )
      return false;
    held.current = true;
    setPressing(true);
    send({ type: 'press', active: true });
    repeat.current = setInterval(() => send({ type: 'press', active: true }), PRESS_REPEAT_MS);
    return true;
  }

  /** 걷는 동안 매 프레임 호출된다. 서버 부하를 줄이려 80ms마다 바뀐 값만 보낸다. */
  function sendMove(x: number, z: number, yaw: number) {
    const now = performance.now();
    const previous = lastMove.current;
    if (now - previous.at < MOVE_INTERVAL_MS) return;
    if (
      Math.abs(previous.x - x) < 0.01 &&
      Math.abs(previous.z - z) < 0.01 &&
      Math.abs(previous.yaw - yaw) < 0.02
    )
      return;
    lastMove.current = { at: now, x, z, yaw };
    send({ type: 'move', x: +x.toFixed(3), z: +z.toFixed(3), yaw: +yaw.toFixed(3) });
  }

  function sit(room: number, seat: number) {
    send({ type: 'sit', room, seat });
  }

  /** 연타는 서버가 쿨다운으로 거른다. */
  function emote(kind: WaxEmoteKind) {
    send({ type: 'emote', kind });
  }

  function stand() {
    stopPress();
    send({ type: 'stand' });
  }

  /** 사용자가 입장 버튼을 눌렀을 때. 초대 링크(?world=)를 쓰지 않으면 자리가 남은 교실로 배정된다. */
  function join(useInvite = true) {
    reconnect.current = null;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    setErrorCode(null);
    connect(useInvite ? new URLSearchParams(window.location.search).get('world') : null);
  }

  function scheduleReconnect() {
    const plan = reconnect.current;
    if (!plan || plan.attempt >= RECONNECT_DELAYS_MS.length) {
      reconnect.current = null;
      setStatus('disconnected');
      return;
    }
    setStatus('reconnecting');
    reconnectTimer.current = setTimeout(() => {
      plan.attempt += 1;
      connect(plan.worldId);
    }, RECONNECT_DELAYS_MS[plan.attempt]);
  }

  function connect(worldId: string | null) {
    stopPress();
    const previous = socket.current;
    socket.current = null;
    previous?.close();
    if (heartbeat.current) clearInterval(heartbeat.current);
    latest.current = null;
    setState(null);
    setError('');
    // 재접속 중에는 이전 레이아웃을 그대로 둬서 3D 장면을 내렸다 다시 올리지 않는다(레이아웃은 월드마다 같다).
    if (!reconnect.current) {
      setWelcome(null);
      setStatus('connecting');
    }
    const endpoint =
      process.env.NEXT_PUBLIC_WAX_WS_URL ?? `ws://${window.location.hostname}:8087/ws/wax`;
    const ws = new WebSocket(endpoint);
    socket.current = ws;
    let joined = false;
    let kicked = false;
    ws.onopen = () => {
      if (socket.current !== ws) return;
      ws.send(JSON.stringify({ type: 'join', ...(worldId ? { worldId } : {}) }));
      heartbeat.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'heartbeat' }));
      }, HEARTBEAT_MS);
    };
    ws.onmessage = (event) => {
      if (socket.current !== ws) return;
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'welcome') {
          const next = message as WaxWelcome;
          joined = true;
          lastActiveAt.current = Date.now();
          setWelcome(next);
          // 이후 연결이 끊기면 같은 교실로 다시 들어간다. 서버는 닫힌 교실도 같은 id로 다시 연다.
          reconnect.current = { worldId: next.worldId, attempt: 0 };
        } else if (message.type === 'state') {
          const next = normalize(message as WaxState);
          latest.current = next;
          setState(next);
          setStatus('connected');
          if (next.you.status !== 'seated' && held.current) stopPress();
        } else if (message.type === 'notice' && message.code === 'idle') {
          kicked = true;
        } else if (message.type === 'error') {
          if (joined) setError(String(message.message));
          else if (reconnect.current) {
            // 재접속 중 그 교실이 가득 찼으면 자리가 남은 교실로 들어간다. 닫히면 onclose가 다음 시도를 예약한다.
            if (message.code === 'world_full') reconnect.current.worldId = null;
            ws.close();
          } else {
            // 첫 입장이 거절됐다. 재접속하지 않고 사유를 보여준다.
            setError(String(message.message));
            setErrorCode(typeof message.code === 'string' ? message.code : null);
            setStatus('error');
            socket.current = null;
            ws.close();
          }
        }
      } catch {
        setError('교실 소식을 읽지 못했어요. 다시 접속해주세요.');
      }
    };
    ws.onerror = () => {
      if (socket.current === ws && !reconnect.current) setError('교실에 연결하지 못했어요.');
    };
    // 서버 재시작(restart 공지 포함)·네트워크 끊김 모두 여기로 온다. 입장한 적이 있으면 같은 교실로 재접속한다.
    ws.onclose = () => {
      if (socket.current !== ws) return;
      socket.current = null;
      stopPress();
      if (heartbeat.current) clearInterval(heartbeat.current);
      latest.current = null;
      setState(null);
      if (kicked) {
        reconnect.current = null;
        setStatus('idle');
      } else if (reconnect.current) scheduleReconnect();
      else setStatus((previous) => (previous === 'error' ? 'error' : 'disconnected'));
    };
  }

  useEffect(() => {
    function release() {
      if (held.current && socket.current?.readyState === WebSocket.OPEN)
        socket.current.send(JSON.stringify({ type: 'press', active: false }));
      held.current = false;
      if (repeat.current) clearInterval(repeat.current);
      repeat.current = null;
      setPressing(false);
    }
    function visibility() {
      if (document.hidden) release();
    }
    function keyup(event: KeyboardEvent) {
      if (event.code === 'Space') release();
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    window.addEventListener('keyup', keyup);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
      window.removeEventListener('keyup', keyup);
      document.removeEventListener('visibilitychange', visibility);
      if (repeat.current) clearInterval(repeat.current);
      if (heartbeat.current) clearInterval(heartbeat.current);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnect.current = null;
      const ws = socket.current;
      socket.current = null;
      ws?.close();
    };
  }, []);

  const layout: WaxLayout | null = welcome?.layout ?? null;

  return {
    state,
    latest,
    layout,
    myId: welcome?.you ?? null,
    worldId: welcome?.worldId ?? null,
    idleTimeoutMs: welcome?.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS,
    lastActiveAt,
    reportActivity,
    status,
    error,
    errorCode,
    clearError: () => setError(''),
    join,
    sendMove,
    sit,
    stand,
    emote,
    pressing,
    startPress,
    stopPress,
  };
}
