import { buildObstacles, canStep, nearestSeat, roomAt, slide } from '@/lib/minigame/waxCollision';
import type { WaxLayout } from '@/types/wax';

/** 서버 WaxLayout.DEFAULT와 같은 모양의 1개 강의실. */
const layout: WaxLayout = {
  hall: { minX: -17.5, maxX: 17.5, minZ: 0, maxZ: 4 },
  doorWidth: 1.8,
  wallZ: 0,
  variants: [],
  rooms: [
    {
      id: 1,
      name: '101호',
      subject: '과학실',
      professorName: '화학 김교수님',
      professorCharacter: 'male-e',
      bounds: { minX: -5.25, maxX: 5.25, minZ: -10, maxZ: 0 },
      doorX: 3.6,
      professorHome: { x: 0, z: -8.6 },
      ejectPoint: { x: 3.6, z: 1.4 },
      seats: [{ index: 0, x: 0, z: -4.85, deskX: 0, deskZ: -5.6, variant: 0 }],
    },
  ],
};

describe('waxCollision', () => {
  const obstacles = buildObstacles(layout);

  it('문으로는 강의실에 들어가고 벽은 통과하지 못한다', () => {
    expect(canStep(layout, { x: 3.6, z: 0.5 }, { x: 3.6, z: -0.5 })).toBe(true);
    expect(canStep(layout, { x: 0, z: 0.5 }, { x: 0, z: -0.5 })).toBe(false);
    expect(canStep(layout, { x: 0, z: 2 }, { x: 2, z: 2 })).toBe(false);
    expect(roomAt(layout, 0, -3)).toBe(1);
    expect(roomAt(layout, 0, 2)).toBe(0);
  });

  it('책상에 막히면 막히지 않은 축으로 미끄러진다', () => {
    const start = { x: 0.2, z: -4.1 };
    const next = slide(layout, obstacles, start, 0.3, -0.3);
    expect(next.z).toBe(start.z);
    expect(next.x).toBeCloseTo(0.5);
  });

  it('같은 강의실 안의 가까운 빈 좌석만 찾는다', () => {
    expect(nearestSeat(layout, { x: 1.5, z: -4.85 }, new Set())?.seat).toBe(0);
    expect(nearestSeat(layout, { x: 1.5, z: -4.85 }, new Set(['1:0']))).toBeNull();
    expect(nearestSeat(layout, { x: 0, z: 2 }, new Set())).toBeNull();
  });
});
