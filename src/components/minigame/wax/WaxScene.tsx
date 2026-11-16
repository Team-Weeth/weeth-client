'use client';

import { Component, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, Group, MathUtils, PMREMGenerator, SRGBColorSpace } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WaxCharacter } from '@/components/minigame/wax/WaxCharacter';
import { WaxHeldBall } from '@/components/minigame/wax/WaxHeldBall';
import {
  SEATED_PITCH,
  SEATED_Y,
  SEATED_YAW_LIMIT,
  seatOf,
  WaxLocalController,
} from '@/components/minigame/wax/WaxLocalController';
import { WaxNameTagContext, WaxNameTagLayer } from '@/components/minigame/wax/WaxNameTags';
import { WaxSchool } from '@/components/minigame/wax/WaxSchool';
import { WAX_PROFESSOR_HEIGHT, WAX_SCENE } from '@/constants/wax';
import { roomAt, WAX_SIT_DISTANCE } from '@/lib/minigame/waxCollision';
import { lockPointer } from '@/lib/minigame/pointerLock';
import type { ReactNode, RefObject } from 'react';
import type { Scene, WebGLRenderer } from 'three';
import type { WaxAnimation, WaxPose } from '@/components/minigame/wax/WaxCharacter';
import type { WaxHeldBallInput } from '@/components/minigame/wax/WaxHeldBall';
import type { CameraRig, LocalState } from '@/components/minigame/wax/WaxLocalController';
import type { WaxNameTagRegistry } from '@/components/minigame/wax/WaxNameTags';
import type {
  WaxEmoteKind,
  WaxLayout,
  WaxPlayer,
  WaxProfessor,
  WaxRoom,
  WaxState,
} from '@/types/wax';

export type WaxView = 'third' | 'first';

/** 화면 버튼·조이스틱이 장면에 넘기는 입력. */
export interface WaxControls {
  joystick: { x: number; y: number };
  sprint: boolean;
  /** 앉기 요청(E 키·버튼). 장면이 처리하면 false로 되돌린다. */
  sitRequest: boolean;
}

export interface WaxNearSeat {
  room: number;
  seat: number;
  variant: number;
}

interface SceneProps {
  layout: WaxLayout;
  myId: string;
  latest: RefObject<WaxState | null>;
  controls: RefObject<WaxControls>;
  heldInput: RefObject<WaxHeldBallInput>;
  view: WaxView;
  /** 좌석 점유·인원 변경 시에만 바뀌는 키. 매 스냅샷마다 장면을 다시 그리지 않으려는 용도다. */
  roster: string;
  seatedVariant: number | null;
  onMove: (x: number, z: number, yaw: number) => void;
  onSit: (room: number, seat: number) => void;
  onNearSeat: (seat: WaxNearSeat | null) => void;
  onPressStart: () => void;
  onReady: () => void;
}

/** 서서 멈춰 있을 때 표현에 맞춰 하는 동작. 앉아 있거나 걷는 중에는 말풍선만 띄운다. */
const EMOTE_ANIMATION: Record<WaxEmoteKind, WaxAnimation> = {
  wave: 'interact-right',
  laugh: 'jump',
  thumbs: 'emote-yes',
  shh: 'crouch',
  help: 'emote-no',
};

function playerAnimation(player: WaxPlayer, moving: boolean): WaxAnimation {
  if (player.status === 'whacked') return 'die';
  if (player.status === 'seated' || player.status === 'spotted') return 'sit';
  if (moving) return 'walk';
  return player.emote ? EMOTE_ANIMATION[player.emote] : 'idle';
}

function professorAnimation(mode: WaxProfessor['mode']): WaxAnimation {
  switch (mode) {
    case 'writing':
      return 'interact-right';
    case 'chasing':
      return 'sprint';
    case 'whacking':
      return 'attack-melee-right';
    case 'returning':
      return 'walk';
    default:
      return 'idle';
  }
}

/** 다른 플레이어. 위치는 스냅샷 사이를 부드럽게 따라간다. */
function RemotePlayer({
  id,
  latest,
  layout,
}: {
  id: string;
  latest: RefObject<WaxState | null>;
  layout: WaxLayout;
}) {
  const previous = useRef({ x: 0, z: 0, at: 0, moving: false });
  const initial = latest.current?.players.find((player) => player.id === id);
  if (!initial) return null;
  return (
    <WaxCharacter
      character={initial.character}
      name={initial.name}
      pose={(): WaxPose | null => {
        const player = latest.current?.players.find((candidate) => candidate.id === id);
        if (!player) return null;
        const memory = previous.current;
        const now = performance.now();
        if (Math.hypot(player.x - memory.x, player.z - memory.z) > 0.02) {
          memory.moving = true;
          memory.at = now;
        } else if (now - memory.at > 180) memory.moving = false;
        memory.x = player.x;
        memory.z = player.z;
        const seat = seatOf(layout, player.room, player.seat);
        const ejected = latest.current?.ejections.some(
          (event) => event.id === id && (latest.current?.now ?? 0) - event.at < 1500,
        );
        return {
          x: player.x,
          z: player.z,
          yaw: player.yaw,
          y: seat ? SEATED_Y : 0,
          animation: playerAnimation(player, memory.moving),
          holding: seat ? seat.variant : null,
          bubble: player.status === 'spotted' || ejected ? '!' : player.emote,
        };
      }}
    />
  );
}

/** 강의실마다 담당 교수님 캐릭터와 이름표가 다르다(서버 레이아웃의 room.professor*). */
function Professor({ room, latest }: { room: WaxRoom; latest: RefObject<WaxState | null> }) {
  return (
    <WaxCharacter
      character={room.professorCharacter}
      name={room.professorName}
      height={WAX_PROFESSOR_HEIGHT}
      rod
      npc
      pose={(): WaxPose | null => {
        const professor = latest.current?.professors.find(
          (candidate) => candidate.room === room.id,
        );
        if (!professor) return null;
        return {
          x: professor.x,
          z: professor.z,
          yaw: professor.yaw,
          animation: professorAnimation(professor.mode),
          bubble:
            professor.mode === 'whacking' ? '딱!' : professor.mode === 'watching' ? '흠…' : null,
        };
      }}
    />
  );
}

/** 쫓겨난 자리(문 앞)에 잠깐 피어오르는 먼지. */
function EjectionPuffs({
  latest,
  layout,
}: {
  latest: RefObject<WaxState | null>;
  layout: WaxLayout;
}) {
  const group = useRef<Group>(null);
  useFrame(() => {
    const state = latest.current;
    const root = group.current;
    if (!root || !state) return;
    root.children.forEach((child, index) => {
      const room = layout.rooms[index];
      const event = state.ejections.filter((candidate) => candidate.room === room.id).at(-1);
      const age = event ? (state.now - event.at) / 1000 : 9;
      child.visible = age < 1.2;
      if (!child.visible) return;
      child.position.set(room.ejectPoint.x, 0.4, room.ejectPoint.z);
      child.scale.setScalar(0.4 + age * 1.6);
      child.children.forEach((puff) => {
        const material = (puff as unknown as { material: { opacity: number } }).material;
        material.opacity = Math.max(0, 0.6 - age * 0.5);
      });
    });
  });
  return (
    <group ref={group}>
      {layout.rooms.map((room) => (
        <group key={room.id} visible={false}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * 1.3) * 0.35,
                Math.sin(i * 2) * 0.15,
                Math.sin(i * 1.3) * 0.35,
              ]}
            >
              <sphereGeometry args={[0.28, 10, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.6} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** 광택 있는 왁스·유리에 비칠 실내 환경맵을 장면에 건다. 정리 함수를 돌려준다. */
function applyRoomEnvironment(gl: WebGLRenderer, scene: Scene) {
  const generator = new PMREMGenerator(gl);
  const environment = generator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.35;
  return () => {
    scene.environment = null;
    environment.dispose();
    generator.dispose();
  };
}

function Lighting() {
  const { gl, scene } = useThree();
  useEffect(() => applyRoomEnvironment(gl, scene), [gl, scene]);
  return (
    <>
      <hemisphereLight args={['#fdfcff', '#b49a7a', 0.85]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[8, 14, 12]}
        intensity={2.2}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={60}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
    </>
  );
}

/**
 * 시점 조작. 3인칭은 드래그 회전·휠 확대, 1인칭과 착석은 포인터 락으로 마우스만 움직여도 돌아간다
 * (터치 기기나 포인터 락을 못 쓰는 환경은 드래그).
 */
function PointerLook({
  rig,
  seated,
  firstPerson,
}: {
  rig: RefObject<CameraRig>;
  seated: boolean;
  firstPerson: boolean;
}) {
  const { gl } = useThree();
  useEffect(() => {
    const element = gl.domElement;
    const look = firstPerson || seated;
    const locked = () => document.pointerLockElement === element;
    if (!look && locked()) document.exitPointerLock();
    // 3인칭으로 걷다 앉으면 아직 마우스가 고정되지 않아 클릭 한 번이 더 필요했다. 착석은 E 키·의자 클릭 직후
    // 서버 확인으로 바뀌므로, 그 입력의 사용자 활성화가 남아 있는 동안 바로 고정한다(만료됐으면 조용히 실패하고
    // 기존처럼 클릭으로 고정된다). Esc로 푼 뒤에는 이 효과가 다시 돌지 않아 강제로 잠그지 않는다.
    if (seated && !locked() && !window.matchMedia('(pointer: coarse)').matches)
      lockPointer(element);
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    /** 1인칭·착석 시점을 돌린다. dy가 양수(아래로 끌기·마우스 내리기)면 아래를 본다. */
    function turn(dx: number, dy: number) {
      const current = rig.current;
      if (seated) {
        if (current.tracking) return;
        current.seatYaw = MathUtils.clamp(
          current.seatYaw + dx,
          -SEATED_YAW_LIMIT,
          SEATED_YAW_LIMIT,
        );
        current.seatPitch = MathUtils.clamp(current.seatPitch - dy, -1.1, 0.7);
        return;
      }
      current.yaw -= dx;
      current.pitch = MathUtils.clamp(current.pitch - dy, -0.9, 1.3);
    }
    function down(event: PointerEvent) {
      // 포인터 락이 거부돼도 드래그로는 둘러볼 수 있게 드래그 상태는 함께 켠다.
      if (look && event.pointerType === 'mouse' && !locked()) lockPointer(element);
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    }
    function move(event: PointerEvent) {
      if (look && locked()) {
        turn(event.movementX * 0.0024, event.movementY * 0.0022);
        return;
      }
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      if (look) {
        turn(dx * 0.006, dy * 0.004);
        return;
      }
      // 3인칭 궤도는 끌어내리면 카메라가 올라간다.
      const current = rig.current;
      current.yaw -= dx * 0.006;
      current.pitch = MathUtils.clamp(current.pitch + dy * 0.004, -0.9, 0.9);
    }
    function up() {
      dragging = false;
    }
    function wheel(event: WheelEvent) {
      if (look) return;
      event.preventDefault();
      rig.current.distance = MathUtils.clamp(rig.current.distance + event.deltaY * 0.006, 2.5, 13);
    }
    element.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    element.addEventListener('wheel', wheel, { passive: false });
    return () => {
      element.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      element.removeEventListener('wheel', wheel);
    };
  }, [gl, rig, seated, firstPerson]);
  return null;
}

function World(props: SceneProps) {
  const { layout, myId, latest, controls, view, roster, seatedVariant } = props;
  const local = useRef<LocalState>({
    x: 0,
    z: 2,
    yaw: Math.PI,
    moving: false,
    sprinting: false,
    initialized: false,
    driftSince: 0,
    lastStatus: '',
    seatKey: '',
    whackedAt: 0,
    playerId: '',
    lean: 0,
  });
  const rig = useRef<CameraRig>({
    yaw: 0,
    pitch: 0.25,
    distance: 6.5,
    seatYaw: 0,
    seatPitch: SEATED_PITCH,
    tracking: false,
  });
  const state = latest.current;
  const occupied = new Set(
    roster
      .split('|')
      .filter((entry) => entry.includes(':'))
      .map((entry) => entry.split('@')[1]),
  );
  const others = (state?.players ?? [])
    .filter((player) => player.id !== myId)
    .map((player) => player.id);
  const me = state?.players.find((player) => player.id === myId);
  const seated = seatedVariant !== null;

  return (
    <>
      <Lighting />
      <group
        onPointerUp={(event) => {
          // 이동은 키보드·조이스틱으로만 한다. 클릭은 가까운 빈 의자에 앉기에만 쓴다.
          if (event.delta > 6 || seated || event.button !== 0) return;
          const point = { x: event.point.x, z: event.point.z };
          const room = layout.rooms.find(
            (candidate) => candidate.id === roomAt(layout, point.x, point.z),
          );
          const seat = room?.seats.find(
            (candidate) =>
              Math.hypot(candidate.x - point.x, candidate.z - point.z) < 0.6 ||
              Math.hypot(candidate.deskX - point.x, candidate.deskZ - point.z) < 0.65,
          );
          if (!room || !seat || occupied.has(`${room.id}:${seat.index}`)) return;
          const me = local.current;
          if (Math.hypot(seat.x - me.x, seat.z - me.z) > WAX_SIT_DISTANCE - 0.2) return;
          event.stopPropagation();
          props.onSit(room.id, seat.index);
        }}
      >
        <WaxSchool layout={layout} />
      </group>
      {others.map((id) => (
        <RemotePlayer key={id} id={id} latest={latest} layout={layout} />
      ))}
      {layout.rooms.map((room) => (
        <Professor key={room.id} room={room} latest={latest} />
      ))}
      {me && (
        <WaxCharacter
          character={me.character}
          name={me.name}
          own
          smooth={false}
          pose={(): WaxPose | null => {
            const server = latest.current?.you;
            const player = latest.current?.players.find((candidate) => candidate.id === myId);
            if (!server || !player) return null;
            const position = local.current;
            const sittingSeat = seatOf(layout, server.room, server.seat);
            const hidden = view === 'first' || sittingSeat !== null;
            const moving = position.moving;
            return {
              x: sittingSeat ? sittingSeat.x : position.x,
              z: sittingSeat ? sittingSeat.z : position.z,
              yaw: sittingSeat ? Math.PI : position.yaw,
              y: sittingSeat ? SEATED_Y : 0,
              animation: sittingSeat
                ? 'sit'
                : moving
                  ? position.sprinting
                    ? 'sprint'
                    : 'walk'
                  : player.emote
                    ? EMOTE_ANIMATION[player.emote]
                    : 'idle',
              bubble: player.emote,
              visible: !hidden,
            };
          }}
        />
      )}
      <EjectionPuffs latest={latest} layout={layout} />
      {seatedVariant !== null && (
        <WaxHeldBall
          key={roster.split('|')[0]}
          variant={seatedVariant}
          input={props.heldInput}
          onPressStart={props.onPressStart}
        />
      )}
      <WaxLocalController
        layout={layout}
        latest={latest}
        controls={controls}
        view={view}
        local={local}
        camera={rig}
        onMove={props.onMove}
        onSit={props.onSit}
        onNearSeat={props.onNearSeat}
        onReady={props.onReady}
      />
      <PointerLook rig={rig} seated={seated} firstPerson={view === 'first' && !seated} />
      <WaxNameTagLayer />
    </>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode; onReady: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onReady();
  }
  render() {
    return this.state.failed ? (
      <div className="text-text-alternative typo-body2 grid h-full place-items-center">
        3D를 표시할 수 없어요. 그래픽 가속을 켠 브라우저에서 다시 열어주세요.
      </div>
    ) : (
      this.props.children
    );
  }
}

export function WaxScene(props: SceneProps & { className?: string }) {
  const nameTags = useRef<WaxNameTagRegistry>({
    layer: null,
    entries: new Set(),
    blocked: () => false,
  });
  return (
    <div className={props.className}>
      <WaxNameTagContext value={nameTags}>
        <SceneBoundary onReady={props.onReady}>
          <Canvas
            shadows
            dpr={[1, 1.75]}
            camera={{ position: [0, 4, 8], fov: 55, near: 0.03, far: 200 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.toneMapping = ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.outputColorSpace = SRGBColorSpace;
              gl.domElement.tabIndex = 0;
              gl.domElement.setAttribute('aria-label', '3D 학교. WASD로 걷고 드래그로 둘러보세요.');
              gl.domElement.style.outline = 'none';
              gl.domElement.style.touchAction = 'none';
            }}
          >
            <color attach="background" args={[WAX_SCENE.sky]} />
            <fog attach="fog" args={[WAX_SCENE.sky, 30, 80]} />
            <World {...props} />
          </Canvas>
        </SceneBoundary>
      </WaxNameTagContext>
      <div
        ref={(element) => {
          nameTags.current.layer = element;
        }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />
    </div>
  );
}
