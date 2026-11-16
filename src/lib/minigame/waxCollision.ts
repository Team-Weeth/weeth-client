import type { WaxLayout, WaxRect, WaxRoom } from '@/types/wax';

/** 서버 `WaxLayout`과 같은 값이어야 한다. 서버는 벽 통과와 1.5m 초과 이동을 거부한다. */
export const WAX_BODY_RADIUS = 0.35;
export const WAX_MAX_STEP = 1.5;
export const WAX_SIT_DISTANCE = 2.5;
/** 천장을 높게 두어 3인칭 카메라가 건물 밖으로 나가지 않고 실내에서 내려다본다. */
export const WAX_WALL_HEIGHT = 6;

export interface WaxBox extends WaxRect {
  kind:
    | 'desk'
    | 'chair'
    | 'teacherDesk'
    | 'locker'
    | 'bench'
    | 'plant'
    | 'prop'
    | 'trash'
    | 'vending'
    | 'fountain'
    | 'kiosk';
}

export interface WaxPoint {
  x: number;
  z: number;
}

/**
 * 강의실 안 교탁·사물함·테마 소품 자리. 렌더링과 충돌이 같은 값을 쓴다.
 * 소품 자리는 교수님 동선(교단 앞 z=-7, 책상 사이 통로)을 피한 앞쪽 오른편 구석과 왼쪽 벽 옆이다.
 */
export function roomFurniture(room: WaxRoom) {
  const centerX = (room.bounds.minX + room.bounds.maxX) / 2;
  return {
    teacherDesk: { x: centerX - 2.4, z: -8.3, width: 1.0, depth: 0.7 },
    cornerProp: { x: centerX + 4.45, z: -8.7, width: 1.4, depth: 1.5 },
    sideProp: { x: centerX - 4.75, z: -4.2, width: 0.7, depth: 3.0 },
    // 교단 왼쪽 구석 쓰레기통. 오른쪽 통로(문·교수님 동선)는 비워 둔다.
    trash: { x: centerX - 4.8, z: -9.45, width: 0.4, depth: 0.4 },
  };
}

/**
 * 복도 소품 배치(로블록스 학교 맵 참고). 문 앞과 쫓겨난 학생이 서는 자리(z≈1.4)는 비워 둔다.
 * 사물함 열은 복도 쪽 벽에 붙고, 문 구멍과 게시판을 피한다.
 */
export function hallFurniture(layout: WaxLayout) {
  const { hall } = layout;
  const perRoom = layout.rooms.flatMap((room) => {
    const centerX = (room.bounds.minX + room.bounds.maxX) / 2;
    return [
      { kind: 'bench' as const, x: centerX - 1.5, z: hall.maxZ - 0.45, width: 2.2, depth: 0.5 },
      { kind: 'trash' as const, x: centerX - 3.0, z: hall.maxZ - 0.35, width: 0.4, depth: 0.4 },
      { kind: 'plant' as const, x: centerX + 4.6, z: hall.maxZ - 0.45, width: 0.6, depth: 0.6 },
      { kind: 'locker' as const, x: centerX + 1.7, z: layout.wallZ + 0.35, width: 3.0, depth: 0.5 },
      { kind: 'locker' as const, x: centerX - 4.1, z: layout.wallZ + 0.35, width: 2.2, depth: 0.5 },
    ];
  });
  return [
    ...perRoom,
    { kind: 'fountain' as const, x: hall.minX + 0.3, z: 2.0, width: 0.45, depth: 0.55 },
    { kind: 'kiosk' as const, x: hall.minX + 0.35, z: 4.5, width: 0.6, depth: 1.0 },
    { kind: 'vending' as const, x: hall.maxX - 0.45, z: 1.9, width: 0.8, depth: 0.95 },
    { kind: 'vending' as const, x: hall.maxX - 0.45, z: 3.0, width: 0.8, depth: 0.95 },
  ];
}

function box(kind: WaxBox['kind'], x: number, z: number, width: number, depth: number): WaxBox {
  return {
    kind,
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  };
}

export function buildObstacles(layout: WaxLayout): WaxBox[] {
  const boxes: WaxBox[] = [];
  for (const room of layout.rooms) {
    // 대학 강의실의 일체형 책걸상: 의자와 오른쪽 책상판이 한 덩어리다.
    for (const seat of room.seats)
      boxes.push(box('chair', seat.x + 0.05, seat.z - 0.08, 0.66, 0.66));
    const { teacherDesk, cornerProp, sideProp, trash } = roomFurniture(room);
    for (const prop of [cornerProp, sideProp])
      boxes.push(box('prop', prop.x, prop.z, prop.width, prop.depth));
    boxes.push(box('trash', trash.x, trash.z, trash.width, trash.depth));
    boxes.push(
      box('teacherDesk', teacherDesk.x, teacherDesk.z, teacherDesk.width, teacherDesk.depth),
    );
  }
  for (const item of hallFurniture(layout))
    boxes.push(box(item.kind, item.x, item.z, item.width, item.depth));
  return boxes;
}

function inside(rect: WaxRect, x: number, z: number, margin = 0) {
  return (
    x >= rect.minX + margin &&
    x <= rect.maxX - margin &&
    z >= rect.minZ + margin &&
    z <= rect.maxZ - margin
  );
}

export function roomAt(layout: WaxLayout, x: number, z: number) {
  return layout.rooms.find((room) => inside(room.bounds, x, z))?.id ?? 0;
}

function inDoorway(layout: WaxLayout, x: number, z: number) {
  return layout.rooms.some(
    (room) =>
      Math.abs(x - room.doorX) <= layout.doorWidth / 2 - WAX_BODY_RADIUS / 2 &&
      Math.abs(z - layout.wallZ) <= 0.6,
  );
}

/** 서버의 `WaxLayout.walkable`과 같은 판정. */
export function walkableArea(layout: WaxLayout, x: number, z: number) {
  return (
    inside(layout.hall, x, z, WAX_BODY_RADIUS) ||
    layout.rooms.some((room) => inside(room.bounds, x, z, WAX_BODY_RADIUS)) ||
    inDoorway(layout, x, z)
  );
}

function blocked(obstacles: WaxBox[], x: number, z: number) {
  const r = WAX_BODY_RADIUS * 0.8;
  return obstacles.some(
    (b) => x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r,
  );
}

/** 서버의 `WaxLayout.canStep`과 같은 판정. 방이 바뀌면 문을 지나는지 확인한다. */
export function canStep(layout: WaxLayout, from: WaxPoint, to: WaxPoint) {
  if (!walkableArea(layout, to.x, to.z)) return false;
  if (Math.hypot(to.x - from.x, to.z - from.z) > WAX_MAX_STEP) return false;
  const a = roomAt(layout, from.x, from.z);
  const b = roomAt(layout, to.x, to.z);
  if (a === b) return true;
  const ratio =
    from.z === to.z ? 0 : Math.min(1, Math.max(0, (layout.wallZ - from.z) / (to.z - from.z)));
  const crossingX = from.x + (to.x - from.x) * ratio;
  const door = layout.rooms.find((room) => room.id === (a || b))?.doorX ?? Infinity;
  return Math.abs(crossingX - door) <= layout.doorWidth / 2 - WAX_BODY_RADIUS / 2;
}

/** 벽과 가구에 막히면 축별로 미끄러지며 이동한다. */
export function slide(
  layout: WaxLayout,
  obstacles: WaxBox[],
  from: WaxPoint,
  dx: number,
  dz: number,
): WaxPoint {
  const ok = (p: WaxPoint) => canStep(layout, from, p) && !blocked(obstacles, p.x, p.z);
  const full = { x: from.x + dx, z: from.z + dz };
  if (ok(full)) return full;
  const alongX = { x: from.x + dx, z: from.z };
  if (Math.abs(dx) > 1e-4 && ok(alongX)) return alongX;
  const alongZ = { x: from.x, z: from.z + dz };
  if (Math.abs(dz) > 1e-4 && ok(alongZ)) return alongZ;
  return from;
}

/** 가까운 빈 좌석. 앉기 안내와 E 키에 쓴다. */
export function nearestSeat(
  layout: WaxLayout,
  position: WaxPoint,
  occupied: Set<string>,
): { room: number; seat: number; distance: number } | null {
  const room = layout.rooms.find(
    (candidate) => candidate.id === roomAt(layout, position.x, position.z),
  );
  if (!room) return null;
  let best: { room: number; seat: number; distance: number } | null = null;
  for (const seat of room.seats) {
    if (occupied.has(`${room.id}:${seat.index}`)) continue;
    const distance = Math.hypot(seat.x - position.x, seat.z - position.z);
    if (distance <= WAX_SIT_DISTANCE - 0.2 && (!best || distance < best.distance))
      best = { room: room.id, seat: seat.index, distance };
  }
  return best;
}
