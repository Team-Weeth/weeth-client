'use client';

import { Component, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ACESFilmicToneMapping,
  Group,
  MathUtils,
  PMREMGenerator,
  Box3,
  Layers,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WaxCharacter } from '@/components/minigame/wax/WaxCharacter';
import { WaxHeldBall } from '@/components/minigame/wax/WaxHeldBall';
import { WAX_BLOCK_LAYER, WaxSchool } from '@/components/minigame/wax/WaxSchool';
import { WAX_PROFESSOR_HEIGHT, WAX_SCENE } from '@/constants/wax';
import {
  buildObstacles,
  nearestSeat,
  roomAt,
  slide,
  WAX_SIT_DISTANCE,
  WAX_WALL_HEIGHT,
} from '@/lib/minigame/waxCollision';
import { lockPointer } from '@/lib/minigame/pointerLock';
import type { ReactNode, RefObject } from 'react';
import type {
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import type { WaxAnimation, WaxPose } from '@/components/minigame/wax/WaxCharacter';
import type { WaxHeldBallInput } from '@/components/minigame/wax/WaxHeldBall';
import type { WaxPoint } from '@/lib/minigame/waxCollision';
import type {
  WaxEmoteKind,
  WaxLayout,
  WaxPlayer,
  WaxProfessor,
  WaxRect,
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

const WALK_SPEED = 3.2;
const SPRINT_SPEED = 5.4;
const EYE_HEIGHT = 1.15;
const SEATED_EYE = 1.0;
/** 치비 캐릭터의 앉기 포즈를 의자 높이에 올리는 값(m). */
const SEATED_Y = 0.3;
/** 앉으면 처음에는 칠판 쪽에서 살짝 아래(책상 위 공)를 본다. */
const SEATED_PITCH = -0.32;
/** 앉은 채로 고개를 돌릴 수 있는 한계. 옆자리와 문까지는 보이고 등 뒤로는 넘어가지 않는다. */
const SEATED_YAW_LIMIT = 1.9;
/** 들켰을 때 바라보는 교수님 높이(가슴과 머리 사이). 회초리를 휘두르는 손까지 화면에 들어온다. */
const PROFESSOR_LOOK_Y = 1.2;
/** 맞음 상태가 된 뒤 회초리가 실제로 내려오는 시점(초). 교수님 공격 동작에 맞춘 값이다. */
const WHACK_IMPACT_DELAY = 0.25;

/** 카메라 조작 상태. yaw·pitch는 걷기 시점, seat*는 착석 시점(칠판 방향 기준)이다. */
interface CameraRig {
  yaw: number;
  pitch: number;
  distance: number;
  seatYaw: number;
  seatPitch: number;
  /** 교수님을 자동으로 바라보는 중이면 마우스 입력을 무시한다. */
  tracking: boolean;
}

/** 각도를 가까운 쪽으로 돌아가며 부드럽게 따라간다. */
function dampAngle(current: number, target: number, lambda: number, delta: number) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return target - diff * Math.exp(-lambda * delta);
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

function seatOf(layout: WaxLayout, room: number, seat: number | null) {
  if (seat === null) return null;
  return layout.rooms.find((candidate) => candidate.id === room)?.seats[seat] ?? null;
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

/** 가릴 수 있는 벽(WAX_BLOCK_LAYER) 메시와 바닥 평면 범위를 한 번 모은다. 학교는 움직이지 않는다. */
function collectWalls(scene: Scene) {
  const layers = new Layers();
  layers.set(WAX_BLOCK_LAYER);
  const walls: Object3D[] = [];
  scene.updateMatrixWorld();
  scene.traverse((object) => {
    if (!(object as Mesh).isMesh || !object.layers.test(layers)) return;
    const box = new Box3().setFromObject(object);
    object.userData.footprint = {
      minX: box.min.x,
      maxX: box.max.x,
      minZ: box.min.z,
      maxZ: box.max.z,
    };
    walls.push(object);
  });
  return walls;
}

/** 선분이 사각형을 지나는지(Liang–Barsky). */
function segmentHitsRect(x0: number, z0: number, x1: number, z1: number, rect: WaxRect) {
  let t0 = 0;
  let t1 = 1;
  const dx = x1 - x0;
  const dz = z1 - z0;
  const checks: [number, number][] = [
    [-dx, x0 - rect.minX],
    [dx, rect.maxX - x0],
    [-dz, z0 - rect.minZ],
    [dz, rect.maxZ - z0],
  ];
  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  // 캐릭터 바로 옆 벽까지 지우지 않도록 끝 0.6 구간은 제외한다.
  return t0 < 1 - 0.6 / Math.max(0.6, Math.hypot(dx, dz));
}

/** 벽 재질을 반투명으로 바꾸거나 원래 투명도(창유리 등)로 되돌린다. */
function setFaded(object: Object3D, faded: boolean) {
  const material = (object as Mesh).material as MeshStandardMaterial | undefined;
  if (!material || Array.isArray(material)) return;
  const base = (object.userData.baseOpacity as number | undefined) ?? 1;
  const opacity = faded ? Math.min(base, 0.15) : base;
  if (material.opacity === opacity) return;
  const transparent = opacity < 1;
  // 불투명 재질은 셰이더에 OPAQUE가 고정되므로 투명 여부가 바뀌면 다시 컴파일해야 한다.
  if (material.transparent !== transparent) material.needsUpdate = true;
  material.transparent = transparent;
  material.opacity = opacity;
  material.depthWrite = !faded;
}

interface LocalState {
  x: number;
  z: number;
  yaw: number;
  moving: boolean;
  sprinting: boolean;
  initialized: boolean;
  driftSince: number;
  lastStatus: string;
  seatKey: string;
  whackedAt: number;
  /** 재접속하면 새 플레이어로 다시 입장하므로 id가 바뀐다. 바뀌면 첫 입장처럼 서버 위치로 맞춘다. */
  playerId: string;
  /** 가까이 온 교수님에게서 몸을 뒤로 빼는 정도(m). 회초리 동작이 화면에 다 들어오게 한다. */
  lean: number;
}

/** 내 캐릭터 이동, 카메라, 앉기 처리. 서버 확인 전에 먼저 움직이고 거부되면 서버 위치로 되돌린다. */
function LocalController({
  layout,
  latest,
  controls,
  view,
  local,
  camera: orbit,
  onMove,
  onSit,
  onNearSeat,
  onReady,
}: {
  layout: WaxLayout;
  latest: RefObject<WaxState | null>;
  controls: RefObject<WaxControls>;
  view: WaxView;
  local: RefObject<LocalState>;
  camera: RefObject<CameraRig>;
  onMove: SceneProps['onMove'];
  onSit: SceneProps['onSit'];
  onNearSeat: SceneProps['onNearSeat'];
  onReady: () => void;
}) {
  const { camera, scene } = useThree();
  const keys = useRef(new Set<string>());
  const [obstacles] = useState(() => buildObstacles(layout));
  const lastNear = useRef('');
  const faded = useRef(new Set<Object3D>());
  const walls = useRef<Object3D[]>([]);
  const interior = useRef({
    minX: Math.min(layout.hall.minX, ...layout.rooms.map((room) => room.bounds.minX)) + 0.3,
    maxX: Math.max(layout.hall.maxX, ...layout.rooms.map((room) => room.bounds.maxX)) - 0.3,
    minZ: Math.min(...layout.rooms.map((room) => room.bounds.minZ)) + 0.3,
    maxZ: layout.hall.maxZ - 0.3,
    maxY: WAX_WALL_HEIGHT - 0.35,
  });

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    const movement = [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'ArrowUp',
      'ArrowLeft',
      'ArrowDown',
      'ArrowRight',
      'ShiftLeft',
      'ShiftRight',
    ];
    function down(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey) return;
      if (event.target instanceof HTMLElement && event.target.closest('input,textarea,select'))
        return;
      if (movement.includes(event.code)) {
        event.preventDefault();
        keys.current.add(event.code);
      }
    }
    function up(event: KeyboardEvent) {
      keys.current.delete(event.code);
    }
    function release() {
      keys.current.clear();
    }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    // 프레임이 낮은 기기에서도 같은 속도로 걷도록 이동에는 더 긴 간격을 허용하고 나눠서 충돌을 검사한다.
    const moveDelta = Math.min(rawDelta, 0.25);
    const state = latest.current;
    const me = local.current;
    const rig = orbit.current;
    const input = controls.current;
    if (!state) return;
    const server = state.you;

    // 서버 상태 반영: 첫 입장, 착석, 퇴장은 서버 위치로 맞춘다.
    if (!me.initialized || me.playerId !== server.id || me.lastStatus !== server.status) {
      if (
        !me.initialized ||
        me.playerId !== server.id ||
        server.status !== 'walking' ||
        me.lastStatus === 'whacked' ||
        me.lastStatus === 'seated'
      ) {
        me.x = server.x;
        me.z = server.z;
        if (!me.initialized) rig.yaw = 0;
      }
      me.initialized = true;
      me.playerId = server.id;
      me.lastStatus = server.status;
    }

    const seat = seatOf(layout, server.room, server.seat);
    if (server.status === 'walking') {
      me.seatKey = '';
      me.whackedAt = 0;
      rig.tracking = false;
      let forward = 0;
      let side = 0;
      const k = keys.current;
      forward +=
        Number(k.has('KeyW') || k.has('ArrowUp')) - Number(k.has('KeyS') || k.has('ArrowDown'));
      side +=
        Number(k.has('KeyD') || k.has('ArrowRight')) - Number(k.has('KeyA') || k.has('ArrowLeft'));
      forward += -input.joystick.y;
      side += input.joystick.x;
      const sprint = input.sprint || k.has('ShiftLeft') || k.has('ShiftRight');
      const speed = (sprint ? SPRINT_SPEED : WALK_SPEED) * moveDelta;
      let dx = 0;
      let dz = 0;
      const magnitude = Math.hypot(forward, side);
      if (magnitude > 0.05) {
        const scale = Math.min(1, magnitude) / magnitude;
        // 카메라가 보는 방향 기준으로 이동한다. 카메라는 +z 쪽에서 -z를 본다(yaw 0).
        const sin = Math.sin(rig.yaw);
        const cos = Math.cos(rig.yaw);
        dx = (-sin * forward + cos * side) * scale * speed;
        dz = (-cos * forward - sin * side) * scale * speed;
      }
      if (dx || dz) {
        const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.15));
        let next: WaxPoint = { x: me.x, z: me.z };
        for (let i = 0; i < steps; i++)
          next = slide(layout, obstacles, next, dx / steps, dz / steps);
        const moved = Math.hypot(next.x - me.x, next.z - me.z);
        me.moving = moved > 1e-4;
        me.sprinting = sprint;
        if (me.moving) me.yaw = Math.atan2(next.x - me.x, next.z - me.z);
        me.x = next.x;
        me.z = next.z;
      } else me.moving = false;

      if (view === 'first' && !me.moving) me.yaw = rig.yaw + Math.PI;
      onMove(me.x, me.z, me.yaw);

      // 서버가 이동을 계속 거부하면 서버 위치로 되돌린다.
      const drift = Math.hypot(server.x - me.x, server.z - me.z);
      if (drift > 1.2) {
        me.driftSince ||= performance.now();
        if (performance.now() - me.driftSince > 700) {
          me.x = server.x;
          me.z = server.z;
          me.driftSince = 0;
        }
      } else me.driftSince = 0;

      // 앉을 수 있는 의자 안내
      const occupied = new Set(
        state.players
          .filter((player) => player.seat !== null)
          .map((player) => `${player.room}:${player.seat}`),
      );
      const near = nearestSeat(layout, me, occupied);
      const nearKey = near ? `${near.room}:${near.seat}` : '';
      if (nearKey !== lastNear.current) {
        lastNear.current = nearKey;
        const variant = near ? (seatOf(layout, near.room, near.seat)?.variant ?? 0) : 0;
        onNearSeat(near ? { room: near.room, seat: near.seat, variant } : null);
      }
      if (input.sitRequest) {
        input.sitRequest = false;
        if (near) onSit(near.room, near.seat);
      }
    } else {
      me.moving = false;
      if (lastNear.current) {
        lastNear.current = '';
        onNearSeat(null);
      }
      input.sitRequest = false;
    }

    // 카메라
    const cam = camera as PerspectiveCamera;
    const thirdPerson = !(seat && server.status !== 'walking') && view !== 'first';
    if (!thirdPerson && faded.current.size) {
      faded.current.forEach((object) => setFaded(object, false));
      faded.current.clear();
    }
    if (
      seat &&
      (server.status === 'seated' || server.status === 'spotted' || server.status === 'whacked')
    ) {
      // 착석: 1인칭처럼 마우스로 둘러본다. seatYaw 0은 칠판(-z), 양수면 +x(화면 오른쪽)를 본다.
      const seatKey = `${server.room}:${server.seat}`;
      if (me.seatKey !== seatKey) {
        me.seatKey = seatKey;
        rig.seatYaw = 0;
        rig.seatPitch = SEATED_PITCH;
      }
      // 들키면 다가와서 때리는 교수님 쪽으로 고개가 저절로 돌아간다.
      const professor =
        server.status === 'seated'
          ? undefined
          : state.professors.find((candidate) => candidate.room === server.room);
      rig.tracking = Boolean(professor);
      let leanX = 0;
      let leanZ = 0;
      if (professor) {
        const dx = professor.x - seat.x;
        const dz = professor.z - seat.z;
        const distance = Math.max(0.01, Math.hypot(dx, dz));
        const pitch = Math.atan2(PROFESSOR_LOOK_Y - SEATED_EYE, distance);
        rig.seatYaw = dampAngle(rig.seatYaw, Math.atan2(dx, -dz), 5, delta);
        rig.seatPitch = MathUtils.damp(rig.seatPitch, pitch, 5, delta);
        leanX = -dx / distance;
        leanZ = -dz / distance;
        me.lean = MathUtils.damp(me.lean, MathUtils.clamp((2 - distance) * 0.4, 0, 0.4), 4, delta);
      } else me.lean = MathUtils.damp(me.lean, 0, 4, delta);
      // 회초리가 내려오는 순간 고개가 휙 젖혀졌다가 돌아온다.
      if (server.status === 'whacked') me.whackedAt ||= performance.now();
      else me.whackedAt = 0;
      const sinceHit = me.whackedAt
        ? (performance.now() - me.whackedAt) / 1000 - WHACK_IMPACT_DELAY
        : -1;
      const hit = sinceHit > 0 ? Math.min(1, sinceHit * 30) * Math.exp(-sinceHit * 6) : 0;
      const shake = Math.sin(performance.now() / 22) * 0.04 * hit;
      const yaw = rig.seatYaw + hit * 0.35;
      const pitch = rig.seatPitch - hit * 0.2;
      cam.position.set(
        seat.x + leanX * me.lean + shake,
        SEATED_EYE - hit * 0.04,
        seat.z + 0.05 + leanZ * me.lean,
      );
      const target = new Vector3(
        cam.position.x + Math.sin(yaw) * Math.cos(pitch),
        cam.position.y + Math.sin(pitch),
        cam.position.z - Math.cos(yaw) * Math.cos(pitch),
      );
      cam.lookAt(target);
      cam.rotateZ(-hit * 0.22);
      // 교수님을 보는 동안은 화각을 넓혀 회초리를 드는 팔까지 보이게 한다.
      cam.fov = MathUtils.damp(cam.fov, rig.tracking ? 78 : 62, 6, delta);
    } else if (view === 'first') {
      cam.position.set(me.x, EYE_HEIGHT, me.z);
      const target = new Vector3(
        me.x - Math.sin(rig.yaw) * Math.cos(rig.pitch - 0.25),
        EYE_HEIGHT + Math.sin(rig.pitch - 0.25),
        me.z - Math.cos(rig.yaw) * Math.cos(rig.pitch - 0.25),
      );
      cam.lookAt(target);
      cam.fov = MathUtils.damp(cam.fov, 70, 6, delta);
    } else {
      const target = new Vector3(me.x, 1.05, me.z);
      const pitch = MathUtils.clamp(rig.pitch + 0.35, 0.08, 1.35);
      const direction = new Vector3(
        Math.sin(rig.yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(rig.yaw) * Math.cos(pitch),
      );
      // 카메라는 건물 안(벽·천장 안쪽)에 머물도록 거리를 줄인다.
      const limits = [rig.distance];
      const room = interior.current;
      if (direction.x > 1e-4) limits.push((room.maxX - target.x) / direction.x);
      if (direction.x < -1e-4) limits.push((room.minX - target.x) / direction.x);
      if (direction.z > 1e-4) limits.push((room.maxZ - target.z) / direction.z);
      if (direction.z < -1e-4) limits.push((room.minZ - target.z) / direction.z);
      if (direction.y > 1e-4) limits.push((room.maxY - target.y) / direction.y);
      const distance = Math.max(1.2, Math.min(...limits));
      const desired = target.clone().addScaledVector(direction, distance);
      cam.position.lerp(desired, 1 - Math.exp(-delta * 14));
      // 카메라와 캐릭터 사이의 벽은 지우지 않고 반투명하게 만든다.
      // 바닥 평면에서 카메라→캐릭터 선분(좌우 0.9m 여유 포함)이 벽 바닥면을 지나면 가린다고 본다.
      if (!walls.current.length) walls.current = collectWalls(scene);
      const hits = new Set<Object3D>();
      const side = new Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(0.9);
      for (const wall of walls.current) {
        const box = wall.userData.footprint as WaxRect;
        for (const offset of [0, 1, -1])
          if (
            segmentHitsRect(
              cam.position.x + side.x * offset,
              cam.position.z + side.z * offset,
              me.x + side.x * offset,
              me.z + side.z * offset,
              box,
            )
          ) {
            hits.add(wall);
            break;
          }
      }
      for (const object of faded.current) if (!hits.has(object)) setFaded(object, false);
      for (const object of hits) setFaded(object, true);
      faded.current = hits;
      cam.lookAt(target);
      // 세로 화면(모바일)에서는 좌우가 좁아 화각을 넓힌다.
      cam.fov = MathUtils.damp(cam.fov, cam.aspect < 1 ? 72 : 55, 6, delta);
    }
    cam.updateProjectionMatrix();
  });
  return null;
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
      <LocalController
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
  return (
    <div className={props.className}>
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
    </div>
  );
}
