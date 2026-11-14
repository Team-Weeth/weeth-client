import { BoxGeometry, BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { roundGeometry } from '@/lib/minigame/waxRounding';

/** 0.32m 머리 상자와, 앞면(z=0.16)에 0.5mm 떠 있는 두께 0인 눈(데칼) */
function headWithEye() {
  const head = new BoxGeometry(0.32, 0.32, 0.32).toNonIndexed().getAttribute('position');
  const z = 0.1605;
  // 눈 사각형(삼각형 2개)을 머리 꼭짓점 뒤에 이어 붙인다.
  const eye = [
    [-0.03, -0.02, z, 0.03, -0.02, z, 0.03, 0.02, z],
    [-0.03, -0.02, z, 0.03, 0.02, z, -0.03, 0.02, z],
  ].flat();
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array([...Array.from(head.array), ...eye]), 3),
  );
  return geometry;
}

function maxZNear(geometry: BufferGeometry, test: (x: number, y: number) => boolean) {
  const position = geometry.getAttribute('position');
  let z = -Infinity;
  for (let i = 0; i < position.count; i++)
    if (test(position.getX(i), position.getY(i))) z = Math.max(z, position.getZ(i));
  return z;
}

describe('roundGeometry', () => {
  it('각진 면을 바깥으로 둥글게 부풀리되 모서리 꼭짓점과 전체 크기는 유지한다', () => {
    const rounded = roundGeometry(new BoxGeometry(1, 1, 1));
    const size = rounded.boundingBox!.getSize(new Vector3());
    expect(size.x).toBeGreaterThan(1);
    expect(size.x).toBeLessThan(1.25);
    // 부푸는 정도는 면 크기의 수십 % 이내(완전한 곡면이면 약 30%)
    // 면 가운데가 원래 평면(z=0.5)보다 앞으로 나온다.
    expect(maxZNear(rounded, (x, y) => Math.abs(x) < 0.2 && Math.abs(y) < 0.2)).toBeGreaterThan(
      0.5,
    );
  });

  it('얼굴 위 평면 조각(눈·입)은 부푼 얼굴에 묻히지 않고 함께 올라온다', () => {
    const rounded = roundGeometry(headWithEye());
    const isEye = (x: number, y: number) => Math.abs(x) <= 0.031 && Math.abs(y) <= 0.021;
    const eye = maxZNear(rounded, (x, y) => isEye(x, y));
    // 눈 주변 얼굴 꼭짓점 중 가장 앞쪽보다도 눈이 앞에 있으면 얼굴 면에 가려지지 않는다.
    const face = maxZNear(
      rounded,
      (x, y) => !isEye(x, y) && Math.abs(x) < 0.07 && Math.abs(y) < 0.07,
    );
    expect(face).toBeGreaterThan(0.16);
    expect(eye).toBeGreaterThan(face);
  });

  it('스킨 가중치는 영향이 큰 뼈 4개로 합이 1이 되게 옮긴다', () => {
    const box = new BoxGeometry(1, 1, 1);
    const count = box.getAttribute('position').count;
    const joints = new Uint16Array(count * 4);
    const weights = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      joints.set([0, 1, 2, 3], i * 4);
      weights.set(
        box.getAttribute('position').getY(i) > 0 ? [1, 0, 0, 0] : [0, 0.5, 0.5, 0],
        i * 4,
      );
    }
    box.setAttribute('skinIndex', new BufferAttribute(joints, 4));
    box.setAttribute('skinWeight', new BufferAttribute(weights, 4));
    const rounded = roundGeometry(box);
    const weight = rounded.getAttribute('skinWeight');
    for (let i = 0; i < weight.count; i += 7) {
      const sum = [0, 1, 2, 3].reduce((acc, s) => acc + weight.getComponent(i, s), 0);
      expect(sum).toBeCloseTo(1, 5);
    }
  });
});
