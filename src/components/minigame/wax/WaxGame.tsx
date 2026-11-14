'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { preloadWaxCharacters } from '@/components/minigame/wax/WaxCharacter';
import { WaxEntryScreen } from '@/components/minigame/wax/WaxEntryScreen';
import { WaxExitDialog } from '@/components/minigame/wax/WaxExitDialog';
import { WaxHelpDialog } from '@/components/minigame/wax/WaxHelpDialog';
import {
  ClassroomBadge,
  DepthButton,
  HelpButton,
  NoiseIndicator,
  NoticeBadge,
  ProfessorAlert,
  ReactionPanel,
  RoomControls,
} from '@/components/minigame/wax/WaxHud';
import { useWaxConnection } from '@/hooks/useWaxConnection';
import { lockPointer } from '@/lib/minigame/pointerLock';
import { WaxAudio } from '@/lib/minigame/waxAudio';
import { WAX_EMOTES } from '@/constants/wax';
import { cn } from '@/lib/cn';
import type { PointerEvent, RefObject } from 'react';
import type { WaxControls, WaxNearSeat, WaxView } from '@/components/minigame/wax/WaxScene';
import type { WaxHeldBallInput } from '@/components/minigame/wax/WaxHeldBall';
import type { WaxState } from '@/types/wax';

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
/** 나가기 모달에서 들어온 방문을 따로 셀 수 있게 utm_content를 붙인다. */
const WEETH_EXIT_URL = `${WEETH_URL}&utm_content=exit`;
/** 이전 페이지 없이 바로 들어온 경우(새 탭·공유 링크) 나가기를 누르면 이동할 곳 */
const EXIT_FALLBACK = '/';

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

/** 화면 왼쪽 아래 가상 조이스틱. 터치 기기에서 걷기에 쓴다. 손잡이는 바깥 원 안에서만 움직인다. */
const JOYSTICK_TRAVEL = 28;

function Joystick({ controlsRef }: { controlsRef: RefObject<WaxControls> }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  function update(event: PointerEvent<HTMLDivElement>) {
    if (!origin.current || origin.current.id !== event.pointerId) return;
    const dx = event.clientX - origin.current.x;
    const dy = event.clientY - origin.current.y;
    const length = Math.min(JOYSTICK_TRAVEL, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const next = { x: Math.cos(angle) * length, y: Math.sin(angle) * length };
    setKnob(next);
    controlsRef.current.joystick = { x: next.x / JOYSTICK_TRAVEL, y: next.y / JOYSTICK_TRAVEL };
  }
  function end() {
    origin.current = null;
    setKnob({ x: 0, y: 0 });
    controlsRef.current.joystick = { x: 0, y: 0 };
  }
  return (
    <div
      aria-label="이동 조이스틱"
      className="bg-neutral-0/70 relative size-[105px] touch-none rounded-full border-2 border-neutral-900/12 backdrop-blur-[6px]"
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
        className="bg-brand-primary absolute top-1/2 left-1/2 size-[49px] rounded-full"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
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
  const [exitOpen, setExitOpen] = useState(false);
  const leaving = useRef(false);
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
  const seatedVariant =
    seat && (you?.status === 'seated' || you?.status === 'spotted' || you?.status === 'whacked')
      ? seat.variant
      : null;

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
      if (document.querySelector('dialog[open], [role=alertdialog]')) return;
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

  // 앱 전환·전화 등으로 멈춘 소리는 다음 터치·키 입력 때 다시 살린다(iOS는 사용자 입력 안에서만 허용).
  useEffect(() => {
    if (!started) return;
    const resume = () => sound.current?.resume();
    const events = ['pointerdown', 'keydown', 'touchend'] as const;
    events.forEach((name) => window.addEventListener(name, resume, { passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, resume));
  }, [started]);

  /*
   * 뒤로가기(모바일 제스처 포함)로 나가려 하면 바로 떠나지 않고 나가기 모달을 띄운다.
   * 입장할 때 같은 주소의 기록을 하나 더 쌓아 두고, 뒤로가기로 그 기록이 빠지면 모달을 열고 다시 쌓는다.
   * 탭 닫기는 브라우저가 직접 만든 모달을 허용하지 않아 다루지 않는다.
   */
  useEffect(() => {
    if (!started) return;
    const guard = () =>
      window.history.pushState({ ...window.history.state, waxExitGuard: true }, '');
    if (!window.history.state?.waxExitGuard) guard();
    function back() {
      if (leaving.current || window.history.state?.waxExitGuard) return;
      if (document.pointerLockElement) document.exitPointerLock();
      setExitOpen(true);
      guard();
    }
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, [started]);

  function leave() {
    leaving.current = true;
    setExitOpen(false);
    // 쌓아 둔 기록과 게임 페이지를 함께 건너 이전 페이지로 간다. 이전 페이지가 없으면 그대로 남으므로 홈으로 보낸다.
    window.history.go(-2);
    setTimeout(() => {
      // 쌓아 둔 기록에 그대로 있으면 돌아갈 곳이 없었다는 뜻이다.
      if (window.history.state?.waxExitGuard) window.location.assign(EXIT_FALLBACK);
    }, 400);
  }

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

      {/* 상단 바: 가장자리에서 10px. 공유는 브라우저 기능으로 충분해 뺐고 도움말은 아래로 옮겼다. */}
      {started && (
        <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-200 px-[10px] pt-400">
          <ClassroomBadge
            label={room ? `${room.name} ${room.subject}` : '복도'}
            shortLabel={room ? room.name : '복도'}
            href={WEETH_URL}
          />
          <RoomControls
            players={state?.players.length ?? 0}
            muted={muted}
            firstPerson={view === 'first'}
            onToggleMute={() => {
              const next = !muted;
              setMuted(next);
              if (sound.current) sound.current.muted = next;
            }}
            onToggleView={() => setView(toggleView(view, touch))}
            onExit={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              setExitOpen(true);
            }}
          />
        </header>
      )}

      {/* GNB 아래 16px 가운데 안내: 쫓겨남, 재연결 */}
      {started && (recentEjections.length > 0 || status === 'reconnecting') && (
        <div className="pointer-events-none absolute inset-x-0 top-[74px] flex flex-col items-center gap-200 px-[10px]">
          {status === 'reconnecting' && (
            <NoticeBadge kind="reconnecting">
              교실을 정비하고 있어요. 다시 연결하는 중...
            </NoticeBadge>
          )}
          {recentEjections.slice(-3).map((event) => (
            <NoticeBadge key={`${event.id}-${event.at}`} kind="ejected">
              {event.name}님이{' '}
              {layout?.rooms.find((candidate) => candidate.id === event.room)?.name}에서 쫓겨났어요
            </NoticeBadge>
          ))}
        </div>
      )}

      {/* 앉기: 조이스틱 오른쪽, 조이스틱 바닥보다 21px 위 */}
      {started && near && you?.status === 'walking' && layout && (
        <DepthButton
          tone="primary"
          label="앉아서 왁뿌볼 깨기"
          shortcut={touch ? undefined : 'E'}
          className="absolute right-[14px] bottom-[45px] w-[220px]"
          onClick={() => (controls.current.sitRequest = true)}
        />
      )}

      {/* 착석: 교수님 상태는 왁뿌볼 바로 위, 소리 게이지는 오른쪽, 일어나기는 아래. 표현 패널은 숨긴다. */}
      {started && seatedVariant !== null && you && (
        <>
          {professor && (
            <ProfessorAlert
              mode={professor.mode}
              className="pointer-events-none absolute left-1/2 -translate-x-1/2"
              // 왁뿌볼은 3D 장면에서 카메라에 붙어 있어 화면 위치를 장면이 CSS 변수로 알려준다.
              style={{ top: 'calc(var(--wax-ball-top, 55%) - 38px)' }}
            />
          )}
          {/* "소리" 글자(21px)가 게이지(14px)보다 넓어 함께 가운데 정렬된다. 게이지가 오른쪽 18px에 오도록 맞춘 값 */}
          <NoiseIndicator
            noise={you.noise}
            className="pointer-events-none absolute right-[14.5px] bottom-[98px]"
          />
          <DepthButton
            tone="neutral"
            label={you.status === 'seated' ? '일어나기' : '들켰다…!'}
            shortcut={touch ? undefined : 'Q'}
            className="absolute bottom-[18px] left-1/2 w-[339px] max-w-[calc(100%-20px)] -translate-x-1/2"
            onClick={() => game.stand()}
          />
        </>
      )}

      {/* 걷는 중: 조이스틱(모바일), 키 안내(PC), 감정 표현과 도움말(오른쪽 10px) */}
      {started && seatedVariant === null && (
        <>
          {touch && (
            <div className="absolute bottom-600 left-600">
              <Joystick controlsRef={controls} />
            </div>
          )}
          <p className="typo-caption1 text-text-strong tablet:block pointer-events-none absolute inset-x-0 bottom-400 hidden text-center drop-shadow">
            {touch
              ? '조이스틱으로 걷기 · 화면 드래그로 둘러보기 · 의자를 눌러 앉기'
              : 'WASD 걷기 · Shift 달리기 · 드래그로 둘러보기 · 휠 확대 · E 앉기 · V 시점 · 1~4 표현'}
          </p>
          {sceneReady && layout && (
            <ReactionPanel
              className="absolute top-1/2 right-[10px] -translate-y-1/2"
              onEmote={(kind) => game.emote(kind)}
            />
          )}
          {!(near && you?.status === 'walking') && (
            <HelpButton
              className="absolute right-[10px] bottom-600"
              onClick={() => help.current?.showModal()}
            />
          )}
        </>
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
            'typo-body2 text-text-strong absolute top-[74px] left-1/2 -translate-x-1/2 px-400 py-200',
          )}
          role="status"
        >
          {notice}
        </div>
      )}

      {/* 진입 화면: 캐릭터·소리·장면을 준비하는 동안 CTA를 막고 로딩 문구를 돌린다. */}
      {(!started || !sceneReady || !layout) &&
        (status === 'error' || status === 'disconnected' ? (
          <WaxEntryScreen
            loading={false}
            actionLabel={game.errorCode === 'world_full' ? '다른 교실로 입장' : '다시 입장하기'}
            onAction={() => game.join(status !== 'error')}
            error={game.error || undefined}
          />
        ) : (
          <WaxEntryScreen
            loading={!assetsReady || starting || (started && !sceneReady)}
            actionLabel="소리 켜고 입장하기"
            onAction={() => void start()}
            error={game.error || undefined}
          />
        ))}

      {/* 연결이 끊긴 뒤 */}
      {/* 입력이 없어 곧 내보내진다 */}
      {started && idleLeft !== null && (
        <div
          className={cn(
            glass,
            'typo-body2 text-text-strong absolute top-[74px] left-1/2 -translate-x-1/2 px-400 py-200 text-center',
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

      <WaxHelpDialog ref={help} weethUrl={WEETH_URL} />
      <WaxExitDialog
        open={exitOpen}
        weethUrl={WEETH_EXIT_URL}
        onStay={() => setExitOpen(false)}
        onLeave={leave}
      />
    </main>
  );
}
