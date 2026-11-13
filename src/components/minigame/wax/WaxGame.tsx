'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Eye, HelpCircle, Link2, PenLine, Users, Volume2, VolumeX } from 'lucide-react';
import { preloadWaxCharacters } from '@/components/minigame/wax/WaxCharacter';
import { useWaxConnection } from '@/hooks/useWaxConnection';
import { lockPointer } from '@/lib/minigame/pointerLock';
import { WaxAudio } from '@/lib/minigame/waxAudio';
import { WAX_EMOTES } from '@/constants/wax';
import { cn } from '@/lib/cn';
import type { PointerEvent, RefObject } from 'react';
import type { WaxControls, WaxNearSeat, WaxView } from '@/components/minigame/wax/WaxScene';
import type { WaxHeldBallInput } from '@/components/minigame/wax/WaxHeldBall';
import type { WaxProfessorMode, WaxState } from '@/types/wax';

const Scene = dynamic(() => import('@/components/minigame/wax/WaxScene').then((m) => m.WaxScene), {
  ssr: false,
  loading: () => (
    <div className="text-text-alternative typo-body2 grid h-full place-items-center">
      학교 문을 여는 중…
    </div>
  ),
});

const WEETH_URL =
  'https://www.weeth.kr/landing?utm_source=wax&utm_medium=minigame&utm_campaign=professor';

const PROFESSOR_LABEL: Record<
  WaxProfessorMode,
  { text: string; tone: 'calm' | 'warn' | 'danger' }
> = {
  writing: { text: '판서 중', tone: 'calm' },
  turning: { text: '어흠… 돌아본다!', tone: 'warn' },
  watching: { text: '보고 있다', tone: 'danger' },
  chasing: { text: '누군가 들켰다', tone: 'danger' },
  whacking: { text: '딱!', tone: 'danger' },
  returning: { text: '교단으로 돌아가는 중', tone: 'warn' },
};

const glass = 'rounded-lg border border-line bg-container-neutral/85 shadow-lg backdrop-blur-md';

function roster(state: WaxState | null) {
  if (!state) return '';
  return state.players
    .map((player) =>
      player.seat === null ? player.id : `${player.id}@${player.room}:${player.seat}`,
    )
    .sort()
    .join('|');
}

/** 화면 왼쪽 아래 가상 조이스틱. 터치 기기에서 걷기에 쓴다. */
function Joystick({ controlsRef }: { controlsRef: RefObject<WaxControls> }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  function update(event: PointerEvent<HTMLDivElement>) {
    if (!origin.current || origin.current.id !== event.pointerId) return;
    const dx = event.clientX - origin.current.x;
    const dy = event.clientY - origin.current.y;
    const length = Math.min(44, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const next = { x: Math.cos(angle) * length, y: Math.sin(angle) * length };
    setKnob(next);
    controlsRef.current.joystick = { x: next.x / 44, y: next.y / 44 };
  }
  function end() {
    origin.current = null;
    setKnob({ x: 0, y: 0 });
    controlsRef.current.joystick = { x: 0, y: 0 };
  }
  return (
    <div
      aria-label="이동 조이스틱"
      className="border-line bg-container-neutral/60 relative size-[112px] touch-none rounded-full border backdrop-blur"
      onPointerDown={(event) => {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          /* 이미 끝난 포인터는 캡처할 수 없다. 이동은 계속 받는다. */
        }
        const rect = event.currentTarget.getBoundingClientRect();
        origin.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          id: event.pointerId,
        };
        update(event);
      }}
      onPointerMove={update}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        className="bg-button-primary absolute top-1/2 left-1/2 size-[48px] rounded-full shadow-md"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}

function NoiseGauge({ noise }: { noise: number }) {
  const value = Math.min(100, Math.max(0, noise));
  return (
    <div className="w-full" aria-label={`소음 ${Math.round(value)}`}>
      <p className="typo-caption1 text-text-strong mb-100">소음</p>
      <div className="bg-container-neutral-alternative relative h-[12px] overflow-hidden rounded-full">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-100',
            value > 70 ? 'bg-state-error' : value > 40 ? 'bg-state-caution' : 'bg-primary-500',
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/**
 * 1인칭으로 바꾸는 키·버튼 입력 안에서 포인터 락을 건다(브라우저는 사용자 입력 중에만 허용한다).
 * setState 갱신 함수 안에서 부르면 개발 모드에서 두 번 실행돼 락 요청이 겹쳐 실패하므로 핸들러에서 직접 부른다.
 */
function toggleView(current: WaxView, touch: boolean): WaxView {
  const next = current === 'third' ? 'first' : 'third';
  const canvas = document.querySelector<HTMLCanvasElement>('[data-testid=wax-game] canvas');
  if (next === 'first' && !touch) lockPointer(canvas);
  if (next === 'third' && document.pointerLockElement) document.exitPointerLock();
  return next;
}

export function WaxGame() {
  const game = useWaxConnection();
  const { state, layout, myId, status, pressing } = game;
  const [started, setStarted] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState<WaxView>('third');
  const [near, setNear] = useState<WaxNearSeat | null>(null);
  const [notice, setNotice] = useState('');
  const [touch, setTouch] = useState(false);
  const [caught, setCaught] = useState(false);
  const [pop, setPop] = useState<{ text: string; key: number; big: boolean } | null>(null);
  /** 서버가 입력 없음으로 내보내기까지 남은 초. 20초 이하일 때만 값이 있다. */
  const [idleLeft, setIdleLeft] = useState<number | null>(null);
  const sound = useRef<WaxAudio | null>(null);
  const controls = useRef<WaxControls>({
    joystick: { x: 0, y: 0 },
    sprint: false,
    sitRequest: false,
  });
  const heldInput = useRef<WaxHeldBallInput>({
    crack: 0,
    layer: 0,
    smallCracks: 0,
    bigCracks: 0,
    pressing: false,
    lowered: false,
  });
  const heard = useRef({ small: -1, big: -1, caughts: -1, whack: '' });
  const help = useRef<HTMLDialogElement>(null);

  const you = state?.you;
  const room = layout?.rooms.find((candidate) => candidate.id === you?.room);
  const seat = room && you?.seat != null ? room.seats[you.seat] : null;
  const professor = state?.professors.find((candidate) => candidate.room === you?.room);
  const mine = state?.players.find((player) => player.id === myId);
  const myName = mine?.name;
  const seatedVariant =
    seat && (you?.status === 'seated' || you?.status === 'spotted' || you?.status === 'whacked')
      ? seat.variant
      : null;
  const invite = game.worldId ? `/play/wax?world=${encodeURIComponent(game.worldId)}` : '';

  useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches);
    void preloadWaxCharacters()
      .then(() => setAssetsReady(true))
      .catch(() => setNotice('캐릭터를 불러오지 못했어요. 새로고침해주세요.'));
  }, []);

  useEffect(() => () => sound.current?.close(), []);

  // 서버 스냅샷 변화를 소리·연출로 바꾼다. 소리는 본인에게만 들린다.
  useEffect(() => {
    if (!state || !layout) return;
    const audio = sound.current;
    const me = state.you;
    const memory = heard.current;
    heldInput.current = {
      crack: me.crack,
      layer: me.layer,
      smallCracks: me.smallCracks,
      bigCracks: me.bigCracks,
      pressing: pressing && me.status === 'seated',
      lowered: me.status === 'spotted' || me.status === 'whacked',
    };
    if (seat) {
      if (memory.small >= 0 && me.smallCracks > memory.small) {
        audio?.smallCrack(seat.variant);
        setPop({ text: '빠직!', key: me.smallCracks * 2, big: false });
      }
      if (memory.big >= 0 && me.bigCracks > memory.big) {
        audio?.bigCrack(seat.variant);
        setPop({ text: '빠자작!', key: me.bigCracks * 2 + 1, big: true });
      }
    }
    memory.small = me.smallCracks;
    memory.big = me.bigCracks;
    if (memory.caughts >= 0 && me.caughts > memory.caughts) setCaught(true);
    memory.caughts = me.caughts;
    // 같은 공간에서 교수님이 때리는 순간 '딱'
    const myRoom =
      me.room === 0 ? null : state.professors.find((candidate) => candidate.room === me.room);
    const whackKey = myRoom?.mode === 'whacking' ? `${myRoom.room}:${myRoom.targetId}` : '';
    if (whackKey && whackKey !== memory.whack && audio) {
      const target = state.players.find((player) => player.id === myRoom?.targetId);
      audio.whack(target ? Math.hypot(target.x - me.x, target.z - me.z) : 4);
    }
    memory.whack = whackKey;
    audio?.setScene(
      me.room === 0 ? 'hallway' : 'classroom',
      Boolean(myRoom && myRoom.mode === 'writing'),
    );
  }, [state, layout, seat, pressing]);

  // 누르는 동안 주무르는 녹음을 0.7초마다 이어 재생하고, 손을 떼면 끊는다.
  const kneadVariant = pressing && seat ? seat.variant : null;
  useEffect(() => {
    const audio = sound.current;
    if (kneadVariant === null || !audio) return;
    audio.knead(kneadVariant);
    const timer = setInterval(() => audio.knead(kneadVariant), 700);
    return () => {
      clearInterval(timer);
      audio.stopKnead();
    };
  }, [kneadVariant]);

  useEffect(() => {
    if (!started) return;
    function down(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey) return;
      if (document.querySelector('dialog[open]')) return;
      // 꾹 누르는 동안 오는 반복 keydown도 막아야 한다. 막지 않으면 포커스가 남은 HUD 버튼(시점 전환 등)이
      // Space를 뗄 때 클릭돼 앉아 있는 사이 몰래 1인칭으로 바뀐다.
      if (event.code === 'Space') {
        event.preventDefault();
        if (!event.repeat) game.startPress();
        return;
      }
      if (event.repeat) return;
      if (event.code === 'KeyE') controls.current.sitRequest = true;
      else if (event.code === 'KeyQ' || event.code === 'Escape') game.stand();
      else if (event.code === 'KeyV') setView(toggleView(view, touch));
      else {
        const emote = WAX_EMOTES[Number(event.code.replace('Digit', '')) - 1];
        if (event.code.startsWith('Digit') && emote) game.emote(emote.kind);
      }
    }
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [started, game, touch, view]);

  useEffect(() => {
    if (!pop) return;
    const timer = setTimeout(() => setPop(null), 650);
    return () => clearTimeout(timer);
  }, [pop]);

  useEffect(() => {
    if (!caught) return;
    const timer = setTimeout(() => setCaught(false), 1800);
    return () => clearTimeout(timer);
  }, [caught]);

  // 둘러보기처럼 서버 명령이 없는 입력도 서버에 알려야 오래 가만히 앉아 둘러보는 사람이 내보내지지 않는다.
  useEffect(() => {
    if (status !== 'connected') return;
    const report = () => game.reportActivity();
    const events = ['keydown', 'pointerdown', 'pointermove', 'wheel', 'touchstart'] as const;
    events.forEach((name) => window.addEventListener(name, report, { passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, report));
  }, [status, game]);

  // 서버가 본 마지막 입력 시각 기준으로 내보내기 20초 전부터 남은 시간을 알린다.
  const { idleTimeoutMs, lastActiveAt } = game;
  useEffect(() => {
    if (status !== 'connected') {
      setIdleLeft(null);
      return;
    }
    const timer = setInterval(() => {
      const remaining = idleTimeoutMs - (Date.now() - lastActiveAt.current);
      setIdleLeft(remaining <= 20_000 ? Math.max(0, Math.ceil(remaining / 1000)) : null);
    }, 1000);
    return () => clearInterval(timer);
  }, [status, idleTimeoutMs, lastActiveAt]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (game.error) setNotice(game.error);
  }, [game.error]);

  async function start() {
    setStarting(true);
    sound.current ??= new WaxAudio();
    try {
      await sound.current.enable();
    } catch {
      setNotice('소리를 불러오지 못했어요. 소리 없이 시작합니다.');
    }
    setStarting(false);
    setStarted(true);
    game.join();
  }

  async function share() {
    if (!invite) return;
    const url = new URL(invite, window.location.origin).href;
    try {
      if (navigator.share)
        await navigator.share({
          title: '교수님 몰래 왁뿌볼',
          text: '수업 중에 왁뿌볼 깨러 올래? 교수님 조심ㅋㅋ',
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        setNotice('초대 링크를 복사했어요. 친구에게 보내주세요.');
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError'))
        setNotice('초대 링크를 길게 눌러 복사해주세요.');
    }
  }

  const label = professor ? PROFESSOR_LABEL[professor.mode] : null;
  const recentEjections = (state?.ejections ?? []).filter(
    (event) => (state?.now ?? 0) - event.at < 3200,
  );

  return (
    <main
      className="bg-container-neutral-alternative fixed inset-0 overflow-hidden select-none"
      data-testid="wax-game"
      data-ready={sceneReady && Boolean(layout)}
      data-world={game.worldId ?? ''}
      data-room={you?.room ?? ''}
      data-status={you?.status ?? ''}
      data-layer={you?.layer ?? ''}
      data-caughts={you?.caughts ?? ''}
      data-x={you?.x.toFixed(2) ?? ''}
      data-z={you?.z.toFixed(2) ?? ''}
    >
      {started && layout && myId ? (
        <div
          className="absolute inset-0"
          onPointerDown={(event) => {
            // 터치는 화면 드래그가 둘러보기라 공을 직접 누르거나 버튼으로만 깬다.
            if (seatedVariant !== null && event.pointerType === 'mouse' && event.button === 0)
              game.startPress();
          }}
        >
          <Scene
            className="absolute inset-0"
            layout={layout}
            myId={myId}
            latest={game.latest}
            controls={controls}
            heldInput={heldInput}
            view={view}
            roster={roster(state)}
            seatedVariant={seatedVariant}
            onMove={game.sendMove}
            onSit={game.sit}
            onNearSeat={setNear}
            onPressStart={game.startPress}
            onReady={() => setSceneReady(true)}
          />
        </div>
      ) : (
        <div className="from-primary-100 to-container-neutral-alternative absolute inset-0 bg-gradient-to-b" />
      )}

      {/* 상단 바 */}
      {started && (
        <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-300 p-400">
          <div
            className={cn(
              glass,
              'tablet:gap-300 tablet:px-400 tablet:py-300 pointer-events-auto flex items-center gap-200 px-300 py-200 whitespace-nowrap',
            )}
          >
            <a
              href={WEETH_URL}
              target="_blank"
              rel="noreferrer"
              className="typo-sub1 text-text-strong"
            >
              weeth <span className="typo-caption1 text-primary-600">PLAY</span>
            </a>
            <span className="bg-line h-[16px] w-px" />
            <span className="typo-button2 text-text-strong">
              {room ? `${room.name} ${room.subject}` : '복도'}
            </span>
            {myName && (
              <span className="typo-caption2 text-text-alternative tablet:inline hidden">
                나 · {myName}
              </span>
            )}
            <span
              className={cn(
                'typo-caption2',
                status === 'connected' ? 'text-primary-600' : 'text-text-alternative',
              )}
            >
              ●<span className="tablet:inline hidden"> </span>
              <span className="tablet:inline hidden">
                {status === 'connected'
                  ? '연결됨'
                  : status === 'connecting'
                    ? '연결 중'
                    : status === 'reconnecting'
                      ? '다시 연결 중'
                      : '연결 끊김'}
              </span>
            </span>
          </div>
          {recentEjections.length > 0 && (
            <div className="pointer-events-none flex flex-col items-center gap-100">
              {recentEjections.slice(-3).map((event) => (
                <div
                  key={`${event.id}-${event.at}`}
                  className={cn(glass, 'typo-button2 text-text-strong px-400 py-200')}
                >
                  👋 {event.name} 님이{' '}
                  {layout?.rooms.find((candidate) => candidate.id === event.room)?.name}에서
                  쫓겨났어요
                </div>
              ))}
            </div>
          )}
          <div
            className={cn(
              glass,
              'tablet:px-200 tablet:py-200 pointer-events-auto flex items-center gap-100 px-100 py-100 whitespace-nowrap',
            )}
          >
            <span className="typo-caption1 text-text-normal flex items-center gap-100 px-200">
              <Users className="size-[16px]" /> {state?.players.length ?? 0}
            </span>
            <button
              aria-label={muted ? '소리 켜기' : '소리 끄기'}
              className="hover:bg-container-neutral-interaction rounded-sm p-200"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (sound.current) sound.current.muted = next;
              }}
            >
              {muted ? <VolumeX className="size-[18px]" /> : <Volume2 className="size-[18px]" />}
            </button>
            <button
              aria-label={view === 'third' ? '1인칭으로 보기' : '3인칭으로 보기'}
              className="typo-caption1 hover:bg-container-neutral-interaction flex items-center gap-100 rounded-sm px-200 py-200"
              onClick={() => setView(toggleView(view, touch))}
            >
              <Eye className="size-[16px]" />
              <span className="tablet:inline hidden">{view === 'third' ? '3인칭' : '1인칭'}</span>
            </button>
            <button
              aria-label="친구 초대"
              className="hover:bg-container-neutral-interaction rounded-sm p-200"
              onClick={() => void share()}
            >
              <Link2 className="size-[18px]" />
            </button>
            <button
              aria-label="도움말"
              className="hover:bg-container-neutral-interaction rounded-sm p-200"
              onClick={() => help.current?.showModal()}
            >
              <HelpCircle className="size-[18px]" />
            </button>
          </div>
        </header>
      )}

      {/* 앉기 안내 */}
      {started && near && you?.status === 'walking' && layout && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[160px] flex justify-center">
          <button
            className={cn(glass, 'pointer-events-auto flex items-center gap-300 px-500 py-300')}
            onClick={() => (controls.current.sitRequest = true)}
          >
            <span className="bg-button-primary typo-button2 text-text-inverse rounded-sm px-200 py-100">
              E
            </span>
            <span className="typo-button1 text-text-strong">앉아서 왁뿌볼 깨기</span>
          </button>
        </div>
      )}

      {/* 착석 HUD */}
      {started && seatedVariant !== null && you && (
        <section className="tablet:inset-x-auto tablet:right-0 tablet:justify-end pointer-events-none absolute inset-x-0 bottom-0 flex justify-center p-400">
          <div
            className={cn(
              glass,
              'tablet:w-[320px] pointer-events-auto flex w-full max-w-[560px] flex-col gap-300 p-400',
            )}
          >
            <div className="flex items-center">
              {label && (
                <span
                  className={cn(
                    'typo-caption1 flex items-center gap-100 rounded-full px-300 py-100',
                    label.tone === 'calm' && 'bg-container-primary-alternative text-primary-700',
                    label.tone === 'warn' && 'bg-state-caution/20 text-text-strong',
                    label.tone === 'danger' && 'bg-state-error/15 text-state-error',
                  )}
                >
                  {label.tone === 'calm' ? (
                    <PenLine className="size-[14px]" />
                  ) : (
                    <Eye className="size-[14px]" />
                  )}
                  교수님 {label.text}
                </span>
              )}
            </div>
            <NoiseGauge noise={you.noise} />
            <div className="flex items-center gap-300">
              <button
                className={cn(
                  'typo-button1 text-text-inverse flex-1 rounded-md py-300 transition-transform',
                  pressing ? 'bg-button-primary-interaction scale-[0.97]' : 'bg-button-primary',
                  you.status !== 'seated' && 'bg-button-disabled',
                )}
                disabled={you.status !== 'seated'}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  game.startPress();
                }}
              >
                {you.status === 'seated' ? '꾹 누르기 (Space)' : '들켰다…!'}
              </button>
              <button
                className="bg-button-neutral typo-button2 text-text-normal rounded-md px-400 py-300"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => game.stand()}
              >
                일어나기 (Q)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 걷는 중 안내와 조이스틱 */}
      {started && seatedVariant === null && (
        <>
          {touch && (
            <div className="absolute bottom-600 left-600 flex items-end gap-300">
              <Joystick controlsRef={controls} />
            </div>
          )}
          <p className="typo-caption1 text-text-strong tablet:block pointer-events-none absolute inset-x-0 bottom-400 hidden text-center drop-shadow">
            {touch
              ? '조이스틱으로 걷기 · 화면 드래그로 둘러보기 · 의자를 눌러 앉기'
              : 'WASD 걷기 · Shift 달리기 · 드래그로 둘러보기 · 휠 확대 · E 앉기 · V 시점 · 1~5 표현'}
          </p>
        </>
      )}

      {/* 표현: 데스크톱은 아래 가운데 줄, 모바일은 조이스틱·착석 HUD를 피해 오른쪽 세로 줄 */}
      {started && sceneReady && layout && (
        <nav
          aria-label="표현 보내기"
          className="tablet:top-auto tablet:right-auto tablet:bottom-[52px] tablet:left-1/2 tablet:-translate-x-1/2 tablet:translate-y-0 tablet:flex-row pointer-events-none absolute top-1/2 right-300 flex -translate-y-1/2 flex-col gap-200"
        >
          {WAX_EMOTES.map((emote, index) => (
            <button
              key={emote.kind}
              aria-label={`${emote.label} 보내기 (${index + 1})`}
              className={cn(
                glass,
                'tablet:size-auto tablet:gap-100 tablet:px-300 tablet:py-200 pointer-events-auto flex size-[44px] items-center justify-center transition-transform active:scale-90',
                mine?.emote === emote.kind && 'ring-primary-500 scale-110 ring-2',
              )}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => game.emote(emote.kind)}
            >
              <span className="text-[20px] leading-none">{emote.icon}</span>
              <span className="typo-caption1 text-text-strong tablet:inline hidden">
                {emote.label}
              </span>
              {!touch && (
                <span className="typo-caption2 text-text-alternative tablet:inline hidden">
                  {index + 1}
                </span>
              )}
            </button>
          ))}
        </nav>
      )}

      {/* 깨지는 소리 의성어 */}
      {pop && seatedVariant !== null && (
        <p
          key={pop.key}
          className={cn(
            'pointer-events-none absolute left-1/2 -translate-x-1/2 animate-bounce font-black drop-shadow-lg',
            pop.big
              ? 'text-state-error bottom-[46%] text-[64px]'
              : 'text-text-strong bottom-[40%] text-[36px]',
          )}
        >
          {pop.text}
        </p>
      )}

      {/* 내가 맞았을 때 */}
      {caught && (
        <div className="bg-state-error/10 pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-state-error animate-bounce text-[120px] leading-none font-black drop-shadow-lg">
              딱!
            </p>
            <p
              className={cn(glass, 'typo-sub3 text-text-strong mt-400 inline-block px-500 py-300')}
            >
              교수님한테 걸려서 복도로 쫓겨났어요
            </p>
          </div>
        </div>
      )}

      {notice && (
        <div
          className={cn(
            glass,
            'typo-body2 text-text-strong absolute top-[88px] left-1/2 -translate-x-1/2 px-400 py-200',
          )}
          role="status"
        >
          {notice}
        </div>
      )}

      {/* 시작 화면 */}
      {(!started || !sceneReady || !layout) && (
        <div className="bg-container-neutral-alternative/70 absolute inset-0 grid place-items-center p-400 backdrop-blur-sm">
          <div
            className={cn(glass, 'flex w-full max-w-[440px] flex-col gap-400 p-600 text-center')}
          >
            <p className="typo-caption1 text-primary-600">WEETH 미니게임</p>
            <h1 className="typo-h2 text-text-strong">교수님 몰래 왁뿌볼</h1>
            <p className="typo-body2 text-text-normal">
              복도를 걸어 강의실에 들어가 빈 의자에 앉으면, 책상 밑에서 왁뿌볼을 깰 수 있어요. 너무
              크게 깨면 교수님이 회초리를 들고 다가와요.
            </p>
            {status === 'error' || status === 'disconnected' ? (
              <button
                className="bg-button-primary typo-button1 text-text-inverse rounded-md py-300"
                onClick={() => game.join(status !== 'error')}
              >
                {game.errorCode === 'world_full' ? '다른 교실로 입장' : '다시 입장하기'}
              </button>
            ) : (
              <button
                className="bg-button-primary typo-button1 text-text-inverse disabled:bg-button-disabled rounded-md py-300"
                disabled={!assetsReady || starting || (started && !sceneReady)}
                onClick={() => void start()}
              >
                {!assetsReady
                  ? '캐릭터 불러오는 중…'
                  : starting
                    ? '소리 준비 중…'
                    : started
                      ? '학교 문 여는 중…'
                      : '소리 켜고 입장하기'}
              </button>
            )}
            {game.error && <p className="typo-caption2 text-state-error">{game.error}</p>}
          </div>
        </div>
      )}

      {/* 서버 재시작·네트워크 끊김 뒤 자동 재접속 중. 장면은 그대로 두고 알리기만 한다. */}
      {started && status === 'reconnecting' && (
        <div
          className={cn(
            glass,
            'typo-body2 text-text-strong absolute top-[88px] left-1/2 -translate-x-1/2 px-400 py-200 whitespace-nowrap',
          )}
          role="status"
        >
          교실을 정비하고 있어요. 다시 연결하는 중…
        </div>
      )}

      {/* 연결이 끊긴 뒤 */}
      {/* 입력이 없어 곧 내보내진다 */}
      {started && idleLeft !== null && (
        <div
          className={cn(
            glass,
            'typo-body2 text-text-strong absolute top-[88px] left-1/2 -translate-x-1/2 px-400 py-200 text-center',
          )}
          role="status"
        >
          아무 입력이 없어서 {idleLeft}초 뒤 교실에서 나가요. 움직이면 계속할 수 있어요.
        </div>
      )}

      {started &&
        sceneReady &&
        layout &&
        (status === 'disconnected' || status === 'error' || status === 'idle') && (
          <div className="bg-container-neutral-alternative/70 absolute inset-0 grid place-items-center backdrop-blur-sm">
            <div className={cn(glass, 'flex flex-col items-center gap-300 p-600')}>
              <p className="typo-sub3 text-text-strong">
                {status === 'idle'
                  ? '오래 움직이지 않아 교실에서 나왔어요'
                  : '교실과 연결이 끊겼어요'}
              </p>
              <button
                className="bg-button-primary typo-button1 text-text-inverse rounded-md px-600 py-300"
                onClick={() => game.join(status !== 'error')}
              >
                다시 입장하기
              </button>
            </div>
          </div>
        )}

      <dialog
        ref={help}
        className="m-auto w-[min(92vw,480px)] rounded-lg p-0 backdrop:bg-black/40"
        aria-label="조작 방법과 출처"
      >
        <div className="flex flex-col gap-300 p-600">
          <h2 className="typo-h3 text-text-strong">조작 방법</h2>
          <ul className="typo-body2 text-text-normal list-disc pl-500">
            <li>WASD·방향키로 걷기, Shift 달리기 (모바일은 조이스틱)</li>
            <li>
              드래그로 둘러보기, 휠로 확대/축소, V로 1인칭 전환(1인칭에서는 마우스만 움직여도
              돌아가요. Esc로 해제)
            </li>
            <li>빈 의자 근처에서 E 또는 의자 클릭으로 앉기, Q로 일어나기</li>
            <li>
              앉아 있을 때도 1인칭처럼 마우스로 둘러볼 수 있어요(화면을 한 번 클릭하면 마우스가
              고정돼요. 모바일은 드래그)
            </li>
            <li>
              Space 또는 마우스를 꾹 눌러 왁뿌볼 깨기(모바일은 공이나 버튼을 꾹). 손을 떼면 소음이
              내려가요
            </li>
            <li>들키면 다가오는 교수님 쪽으로 시선이 저절로 돌아가요</li>
            <li>
              숫자 1~5 또는 표현 버튼으로 친구에게 인사·ㅋㅋㅋ·최고·쉿·살려줘를 보낼 수 있어요
            </li>
            <li>교수님이 돌아보는 중에는 같은 소리도 더 크게 들켜요</li>
          </ul>
          <h2 className="typo-sub2 text-text-strong">출처</h2>
          <p className="typo-caption2 text-text-alternative">
            왁뿌볼 소리:{' '}
            <a
              className="underline"
              href="https://github.com/apple77771/wakppuball-simulator"
              target="_blank"
              rel="noreferrer"
            >
              WAK-PPU-BALL sound effects
            </a>{' '}
            by apple77771,{' '}
            <a
              className="underline"
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY 4.0
            </a>
            . 게임에서 구간·음높이·음량을 바꿔 재생해요.
          </p>
          <p className="typo-caption2 text-text-alternative">
            회초리·교실 배경음: Freesound CC0(Qat, okieactor, SEF7, DeanHopkins). 캐릭터: Kenney
            Mini Characters (CC0). 자세한 내용은 /audio/wax/CREDITS.md에 있어요.
          </p>
          <div className="flex justify-end gap-200">
            <a
              href={WEETH_URL}
              target="_blank"
              rel="noreferrer"
              className="bg-button-neutral typo-button2 text-text-normal rounded-md px-400 py-200"
            >
              Weeth 알아보기
            </a>
            <button
              className="bg-button-primary typo-button2 text-text-inverse rounded-md px-400 py-200"
              onClick={() => help.current?.close()}
            >
              닫기
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
