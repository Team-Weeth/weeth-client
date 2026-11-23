'use client';

import { useEffect, useRef, useState } from 'react';
import { saveWaxNickname, waxDeviceToken, WAX_NICKNAME_PATTERN } from '@/lib/minigame/waxIdentity';
import type { WaxCommand, WaxEmoteKind, WaxLayout, WaxState, WaxWelcome } from '@/types/wax';

type ConnectionStatus =
  | 'idle'
  | 'connecting'
  /** 연결은 됐고 닉네임 결정 모달에서 이름을 고르는 중이다. 아직 입장(join)하지 않았다. */
  | 'naming'
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
  /** 서버가 연결 직후 보낸 추천 닉네임 */
  const [suggestion, setSuggestion] = useState<string | null>(null);
  /** 서버가 닉네임을 거절한 사유(invalid_name). 모달에 띄운다. */
  const [nameError, setNameError] = useState('');
  const socket = useRef<WebSocket | null>(null);
  /** 입장할 때 쓸 이름. 재접속 때도 같은 이름으로 들어간다. 없으면 서버가 무작위로 고른다. */
  const name = useRef<string | null>(null);
  /** 닉네임 모달을 띄운 동안 들어갈 교실(초대 링크) */
  const entryWorld = useRef<string | null>(null);
  /** 지금 연결에서 입장(welcome)을 받았는지. 받기 전에는 게임 명령을 보내지 않는다. */
  const entered = useRef(false);
  /** 닉네임 모달 단계인지. 이 동안 연결이 끊겨도(서버의 입장 전 대기 한도) 끊김 화면을 띄우지 않는다. */
  const naming = useRef(false);
  /** 모달에서 이름을 골라 입장(join)을 보냈고 아직 welcome을 받지 못했다. 이때는 모달이 닫혀 있다. */
  const submitted = useRef(false);

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
    // 입장(welcome) 전 게임 명령은 서버가 거절하고, 그 거절이 첫 입장 실패로 처리돼 연결이 끊긴다. 보내지 않는다.
    if (socket.current?.readyState !== WebSocket.OPEN || !entered.current) return;
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

  function joinCommand(worldId: string | null): WaxCommand {
    return {
      type: 'join',
      ...(worldId ? { worldId } : {}),
      ...(name.current ? { name: name.current } : {}),
      // 랭킹에서 같은 기기를 같은 사람으로 본다. 서버는 해시만 저장한다.
      token: waxDeviceToken(),
    };
  }

  function inviteWorld(useInvite: boolean) {
    return useInvite ? new URLSearchParams(window.location.search).get('world') : null;
  }

  /** 다시 입장하기. 고른 이름이 있으면 그 이름으로 바로 들어간다. 초대 링크(?world=)를 쓰지 않으면 자리가 남은 교실로 배정된다. */
  function join(useInvite = true) {
    reconnect.current = null;
    naming.current = false;
    submitted.current = false;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    setErrorCode(null);
    connect(inviteWorld(useInvite), true);
  }

  /** 입장 버튼을 눌렀을 때. 연결해서 추천 닉네임을 받고, 이름을 고를 때까지 입장(join)은 미룬다. */
  function prepare(useInvite = true) {
    reconnect.current = null;
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    setErrorCode(null);
    setNameError('');
    setSuggestion(null);
    naming.current = true;
    submitted.current = false;
    entryWorld.current = inviteWorld(useInvite);
    connect(entryWorld.current, false);
  }

  /** 닉네임 모달에서 이름을 골랐을 때. 모달에 오래 머물러 연결이 끊겼으면 다시 연결해 바로 입장한다. */
  function enter(chosen: string) {
    name.current = chosen;
    submitted.current = true;
    setNameError('');
    const ws = socket.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(joinCommand(entryWorld.current)));
    } else connect(entryWorld.current, true);
  }

  /** 닉네임 모달을 닫았을 때. 입장하지 않은 연결을 닫는다. */
  function cancelNaming() {
    naming.current = false;
    submitted.current = false;
    const ws = socket.current;
    socket.current = null;
    ws?.close();
    if (heartbeat.current) clearInterval(heartbeat.current);
    setStatus('idle');
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
      connect(plan.worldId, true);
    }, RECONNECT_DELAYS_MS[plan.attempt]);
  }

  function connect(worldId: string | null, autoJoin: boolean) {
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
    entered.current = false;
    ws.onopen = () => {
      if (socket.current !== ws) return;
      if (autoJoin) ws.send(JSON.stringify(joinCommand(worldId)));
      heartbeat.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'heartbeat' }));
      }, HEARTBEAT_MS);
    };
    ws.onmessage = (event) => {
      if (socket.current !== ws) return;
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'hello') {
          setSuggestion(typeof message.suggestion === 'string' ? message.suggestion : null);
          if (naming.current) setStatus('naming');
        } else if (message.type === 'welcome') {
          const next = message as WaxWelcome;
          joined = true;
          entered.current = true;
          naming.current = false;
          submitted.current = false;
          // 직접 입력한 이름만 다음 방문 때 미리 채운다. 추천 이름은 매번 새로 받는다.
          // 서버가 받아준 뒤에 저장해야 거절된 이름이 다음 방문 때 다시 채워지지 않는다.
          if (name.current && WAX_NICKNAME_PATTERN.test(name.current))
            saveWaxNickname(name.current);
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
          else if (message.code === 'invalid_name') {
            // 연결은 그대로 두고 모달에서 다시 고르게 한다.
            submitted.current = false;
            setNameError(String(message.message));
            setStatus('naming');
          } else if (reconnect.current) {
            // 재접속 중 그 교실이 가득 찼으면 자리가 남은 교실로 들어간다. 닫히면 onclose가 다음 시도를 예약한다.
            if (message.code === 'world_full') reconnect.current.worldId = null;
            ws.close();
          } else {
            // 첫 입장이 거절됐다. 재접속하지 않고 사유를 보여준다.
            naming.current = false;
            submitted.current = false;
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
      // 모달에 머무는 동안 끊겼다. 이름을 고르면 enter가 다시 연결한다.
      if (naming.current && !joined && !submitted.current) setStatus('naming');
      else if (kicked) {
        reconnect.current = null;
        setStatus('idle');
      } else {
        // 이름을 보낸 뒤 welcome 전에 끊겼다(배포 중 재시작 등). 모달은 이미 닫혔으니 고른 이름으로 다시 들어간다.
        if (submitted.current && !reconnect.current)
          reconnect.current = { worldId: entryWorld.current, attempt: 0 };
        if (reconnect.current) scheduleReconnect();
        else setStatus((previous) => (previous === 'error' ? 'error' : 'disconnected'));
      }
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
    suggestion,
    nameError,
    join,
    prepare,
    enter,
    cancelNaming,
    sendMove,
    sit,
    stand,
    emote,
    pressing,
    startPress,
    stopPress,
  };
}
