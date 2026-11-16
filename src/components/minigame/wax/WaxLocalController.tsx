'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Layers, MathUtils, Vector3 } from 'three';
import { WaxNameTagContext } from '@/components/minigame/wax/WaxNameTags';
import { WAX_BLOCK_LAYER } from '@/components/minigame/wax/WaxSchool';
import { buildObstacles, nearestSeat, slide, WAX_WALL_HEIGHT } from '@/lib/minigame/waxCollision';
import type { RefObject } from 'react';
import type { Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, Scene } from 'three';
import type { WaxControls, WaxNearSeat, WaxView } from '@/components/minigame/wax/WaxScene';
import type { WaxFadeUnit } from '@/components/minigame/wax/WaxSchool';
import type { WaxPoint } from '@/lib/minigame/waxCollision';
import type { WaxLayout, WaxRect, WaxState } from '@/types/wax';

const WALK_SPEED = 3.2;
const SPRINT_SPEED = 5.4;
const EYE_HEIGHT = 1.15;
const SEATED_EYE = 1.0;
/** 치비 캐릭터의 앉기 포즈를 의자 높이에 올리는 값(m). */
export const SEATED_Y = 0.3;
/** 앉으면 처음에는 칠판 쪽에서 살짝 아래(책상 위 공)를 본다. */
export const SEATED_PITCH = -0.32;
/** 앉은 채로 고개를 돌릴 수 있는 한계. 옆자리와 문까지는 보이고 등 뒤로는 넘어가지 않는다. */
export const SEATED_YAW_LIMIT = 1.9;
/** 들켰을 때 바라보는 교수님 높이(가슴과 머리 사이). 회초리를 휘두르는 손까지 화면에 들어온다. */
const PROFESSOR_LOOK_Y = 1.2;
/** 맞음 상태가 된 뒤 회초리가 실제로 내려오는 시점(초). 교수님 공격 동작에 맞춘 값이다. */
const WHACK_IMPACT_DELAY = 0.25;

/** 카메라 조작 상태. yaw·pitch는 걷기 시점, seat*는 착석 시점(칠판 방향 기준)이다. */
export interface CameraRig {
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

export function seatOf(layout: WaxLayout, room: number, seat: number | null) {
  if (seat === null) return null;
  return layout.rooms.find((candidate) => candidate.id === room)?.seats[seat] ?? null;
}

/** 함께 흐려지는 메시 묶음. 벽 조각 하나이거나 fadeUnit 그룹(사물함 한 줄, 게시판 등) 전체다. */
interface FadeTarget {
  meshes: Mesh[];
  /** 바닥 평면에서 차지하는 범위 */
  footprint: WaxRect;
  /** 벽처럼 좌우 여유를 두고 가림을 판정할지 */
  margin: boolean;
  minY: number;
  maxY: number;
}

/** 이름표 높이(약 1.4~2m)를 막는 벽인지. 창턱·문 위 벽처럼 위아래가 트인 조각은 이름표를 가리지 않는다. */
function blocksNameTag(target: FadeTarget) {
  return target.minY < 1.2 && target.maxY > 2;
}

/** 가릴 수 있는 벽(WAX_BLOCK_LAYER)을 흐릴 단위로 한 번 모은다. 학교는 움직이지 않는다. */
function collectWalls(scene: Scene) {
  const layers = new Layers();
  layers.set(WAX_BLOCK_LAYER);
  const targets = new Map<Object3D, FadeTarget>();
  scene.updateMatrixWorld();
  scene.traverse((object) => {
    if (!(object as Mesh).isMesh || !object.layers.test(layers)) return;
    let root: Object3D = object;
    for (let parent = object.parent; parent; parent = parent.parent)
      if (parent.userData.fadeUnit) {
        root = parent;
        break;
      }
    const box = new Box3().setFromObject(object);
    const target = targets.get(root);
    if (target) {
      target.footprint.minX = Math.min(target.footprint.minX, box.min.x);
      target.footprint.maxX = Math.max(target.footprint.maxX, box.max.x);
      target.footprint.minZ = Math.min(target.footprint.minZ, box.min.z);
      target.footprint.maxZ = Math.max(target.footprint.maxZ, box.max.z);
      target.minY = Math.min(target.minY, box.min.y);
      target.maxY = Math.max(target.maxY, box.max.y);
      return;
    }
    targets.set(root, {
      meshes: [],
      footprint: { minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z },
      margin: (root.userData.fadeUnit as WaxFadeUnit | undefined) !== 'furniture',
      minY: box.min.y,
      maxY: box.max.y,
    });
  });
  // 묶음은 레이어에 없는 장식(환기구·손잡이·포스터)까지 함께 흐린다.
  for (const [root, target] of targets)
    root.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material as MeshStandardMaterial;
      mesh.userData.baseOpacity ??= material.opacity;
      mesh.userData.baseTransparent = material.transparent;
      target.meshes.push(mesh);
    });
  return [...targets.values()];
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

/** 벽 재질을 반투명으로 바꾸거나 원래 투명도(창유리, 투명 배경 표지판 등)로 되돌린다. */
function setFaded(target: FadeTarget, faded: boolean) {
  for (const mesh of target.meshes) {
    const material = mesh.material as MeshStandardMaterial | undefined;
    if (!material || Array.isArray(material)) continue;
    const base = mesh.userData.baseOpacity as number;
    const opacity = faded ? Math.min(base, 0.15) : base;
    if (material.opacity === opacity && material.depthWrite === !faded) continue;
    const transparent = faded || (mesh.userData.baseTransparent as boolean);
    // 불투명 재질은 셰이더에 OPAQUE가 고정되므로 투명 여부가 바뀌면 다시 컴파일해야 한다.
    if (material.transparent !== transparent) material.needsUpdate = true;
    material.transparent = transparent;
    material.opacity = opacity;
    material.depthWrite = !faded;
  }
}

export interface LocalState {
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
export function WaxLocalController({
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
  onMove: (x: number, z: number, yaw: number) => void;
  onSit: (room: number, seat: number) => void;
  onNearSeat: (seat: WaxNearSeat | null) => void;
  onReady: () => void;
}) {
  const { camera, scene } = useThree();
  const keys = useRef(new Set<string>());
  const [obstacles] = useState(() => buildObstacles(layout));
  const lastNear = useRef('');
  const faded = useRef(new Set<FadeTarget>());
  const walls = useRef<FadeTarget[]>([]);
  const nameTags = useContext(WaxNameTagContext);
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

  // 다른 강의실 사람의 이름표가 벽 너머로 보이지 않게 한다.
  // 지금 흐려진 벽(카메라와 나 사이)은 비쳐 보이므로 제외한다.
  useEffect(() => {
    const registry = nameTags?.current;
    if (!registry) return;
    registry.blocked = (fromX, fromZ, toX, toZ) => {
      if (!walls.current.length) walls.current = collectWalls(scene);
      return walls.current.some(
        (wall) =>
          blocksNameTag(wall) &&
          !faded.current.has(wall) &&
          segmentHitsRect(fromX, fromZ, toX, toZ, wall.footprint),
      );
    };
    return () => {
      registry.blocked = () => false;
    };
  }, [nameTags, scene]);

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
        // 앉자마자 그 강의실 교수님 쪽으로 고개를 돌린다. 둘러볼 수 있는 범위를 넘지는 않는다.
        const teacher = state.professors.find((candidate) => candidate.room === server.room);
        rig.seatYaw = teacher
          ? MathUtils.clamp(
              Math.atan2(teacher.x - seat.x, -(teacher.z - seat.z)),
              -SEATED_YAW_LIMIT,
              SEATED_YAW_LIMIT,
            )
          : 0;
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
      // 바닥 평면에서 카메라→캐릭터 선분(벽은 좌우 0.9m 여유 포함)이 바닥면을 지나면 가린다고 본다.
      // 홀로 선 가구는 여유 없이 판정한다. 옆을 지나기만 해도 흐려지면 물체가 깜빡이는 것처럼 보인다.
      if (!walls.current.length) walls.current = collectWalls(scene);
      const hits = new Set<FadeTarget>();
      const side = new Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(0.9);
      for (const wall of walls.current) {
        for (const offset of wall.margin ? [0, 1, -1] : [0])
          if (
            segmentHitsRect(
              cam.position.x + side.x * offset,
              cam.position.z + side.z * offset,
              me.x + side.x * offset,
              me.z + side.z * offset,
              wall.footprint,
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
