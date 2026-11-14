import { Box3, BufferAttribute, BufferGeometry, Vector3 } from 'three';

/**
 * 로우폴리 캐릭터(Kenney Mini Characters)를 클레이처럼 둥글게 만든다.
 *
 * 같은 위치의 꼭짓점 법선을 평균해 모서리 법선을 만들고, 각 삼각형을 그 법선으로 휘는 곡면 삼각형
 * (PN triangles, Vlachos 2001)으로 다시 쪼갠다. 곡면은 변의 두 끝점과 법선만으로 정해져, 이웃 삼각형과
 * 같은 곡선을 공유하므로 틈이 생기지 않는다. UV(팔레트 색)와 스킨 가중치는 무게중심 좌표로 옮겨 뼈대
 * 애니메이션과 색은 그대로 유지된다.
 *
 * 눈·입처럼 두께가 0인 평면 조각(데칼)은 얼굴 면 위에 살짝 떠 있어서, 얼굴만 부풀리면 그 안에 묻힌다.
 * 데칼은 둥글게 하지 않고 같은 밀도로 쪼갠 뒤, 바로 아래 면이 부푼 만큼 함께 밀어 올린다.
 *
 * @param level 변 하나를 몇 조각으로 나눌지. 삼각형 수는 level² 배가 된다.
 * @param strength 0이면 원래 각진 모양, 1이면 완전한 곡면. 실루엣을 지키려고 중간값을 쓴다.
 */
export function roundGeometry(geometry: BufferGeometry, level = 3, strength = 0.75) {
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  const skinIndex = geometry.getAttribute('skinIndex');
  const skinWeight = geometry.getAttribute('skinWeight');
  const index = geometry.getIndex();
  const corners = index ? Array.from(index.array) : [...Array(position.count).keys()];

  const smooth = smoothNormals(position, corners);
  const decal = flatComponents(position, corners);
  const surfaces = surfaceTriangles(position, corners, smooth, decal);

  const triangles = corners.length / 3;
  const perTriangle = ((level + 1) * (level + 2)) / 2;
  const vertexCount = triangles * perTriangle;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = uv ? new Float32Array(vertexCount * 2) : null;
  const joints = skinIndex ? new Uint16Array(vertexCount * 4) : null;
  const weights = skinWeight ? new Float32Array(vertexCount * 4) : null;
  const indices: number[] = [];

  const p = [new Vector3(), new Vector3(), new Vector3()];
  const n = [new Vector3(), new Vector3(), new Vector3()];
  const control = Array.from({ length: 10 }, () => new Vector3());
  const point = new Vector3();
  const flat = new Vector3();
  const normal = new Vector3();
  let vertex = 0;

  for (let t = 0; t < triangles; t++) {
    const ids = [corners[t * 3], corners[t * 3 + 1], corners[t * 3 + 2]];
    for (let k = 0; k < 3; k++) {
      p[k].fromBufferAttribute(position, ids[k]);
      n[k].copy(smooth[ids[k]]);
    }
    const isDecal = decal[t];
    if (!isDecal) pnControlPoints(p, n, control);

    const base = vertex;
    for (let i = 0; i <= level; i++) {
      for (let j = 0; j <= level - i; j++) {
        // 꼭짓점 0·1·2의 무게중심 좌표
        const b1 = j / level;
        const b2 = i / level;
        const b0 = 1 - b1 - b2;
        flat
          .set(0, 0, 0)
          .addScaledVector(p[0], b0)
          .addScaledVector(p[1], b1)
          .addScaledVector(p[2], b2);
        normal
          .set(0, 0, 0)
          .addScaledVector(n[0], b0)
          .addScaledVector(n[1], b1)
          .addScaledVector(n[2], b2)
          .normalize();
        if (isDecal) {
          point.copy(flat);
          liftOntoSurface(point, normal, surfaces, strength);
        } else {
          evaluate(control, b0, b1, b2, point);
          point.lerpVectors(flat, point, strength);
        }
        positions.set([point.x, point.y, point.z], vertex * 3);
        normals.set([normal.x, normal.y, normal.z], vertex * 3);

        if (uv && uvs) {
          uvs[vertex * 2] = b0 * uv.getX(ids[0]) + b1 * uv.getX(ids[1]) + b2 * uv.getX(ids[2]);
          uvs[vertex * 2 + 1] = b0 * uv.getY(ids[0]) + b1 * uv.getY(ids[1]) + b2 * uv.getY(ids[2]);
        }
        if (skinIndex && skinWeight && joints && weights)
          blendSkin(skinIndex, skinWeight, ids, [b0, b1, b2], joints, weights, vertex);
        vertex++;
      }
    }

    // 격자 (i, j)의 꼭짓점 번호
    const at = (i: number, j: number) => base + i * (level + 1) - (i * (i - 1)) / 2 + j;
    for (let i = 0; i < level; i++) {
      for (let j = 0; j < level - i; j++) {
        indices.push(at(i, j), at(i, j + 1), at(i + 1, j));
        if (j < level - i - 1) indices.push(at(i, j + 1), at(i + 1, j + 1), at(i + 1, j));
      }
    }
  }

  const result = new BufferGeometry();
  result.setAttribute('position', new BufferAttribute(positions, 3));
  result.setAttribute('normal', new BufferAttribute(normals, 3));
  if (uvs) result.setAttribute('uv', new BufferAttribute(uvs, 2));
  if (joints) result.setAttribute('skinIndex', new BufferAttribute(joints, 4));
  if (weights) result.setAttribute('skinWeight', new BufferAttribute(weights, 4));
  result.setIndex(indices);
  result.computeBoundingBox();
  result.computeBoundingSphere();
  return result;
}

const positionKey = (position: BufferGeometry['attributes']['position'], i: number) =>
  `${position.getX(i).toFixed(4)},${position.getY(i).toFixed(4)},${position.getZ(i).toFixed(4)}`;

/** 위치로 이어진 조각 중 한 축의 두께가 0인 것(눈·입 데칼)에 속한 삼각형을 표시한다. */
function flatComponents(position: BufferGeometry['attributes']['position'], corners: number[]) {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    let root = x;
    while (parent.get(root) !== undefined && parent.get(root) !== root) root = parent.get(root)!;
    parent.set(x, root);
    return root;
  };
  const union = (a: string, b: string) => {
    if (!parent.has(a)) parent.set(a, a);
    if (!parent.has(b)) parent.set(b, b);
    parent.set(find(a), find(b));
  };
  const keys = corners.map((corner) => positionKey(position, corner));
  for (let t = 0; t < keys.length; t += 3) {
    union(keys[t], keys[t + 1]);
    union(keys[t + 2], keys[t + 1]);
  }
  const bounds = new Map<string, Box3>();
  const point = new Vector3();
  corners.forEach((corner, k) => {
    const root = find(keys[k]);
    const box = bounds.get(root) ?? new Box3();
    box.expandByPoint(point.fromBufferAttribute(position, corner));
    bounds.set(root, box);
  });
  const size = new Vector3();
  const flat = new Set(
    [...bounds]
      .filter(([, box]) => Math.min(...box.getSize(size).toArray()) < 1e-3)
      .map(([root]) => root),
  );
  return Array.from({ length: keys.length / 3 }, (_, t) => flat.has(find(keys[t * 3])));
}

interface Surface {
  p: Vector3[];
  control: Vector3[];
  normal: Vector3;
}

/** 데칼이 올라탈 수 있는 일반 삼각형과 그 곡면 제어점 */
function surfaceTriangles(
  position: BufferGeometry['attributes']['position'],
  corners: number[],
  smooth: Vector3[],
  decal: boolean[],
) {
  const surfaces: Surface[] = [];
  for (let t = 0; t < corners.length / 3; t++) {
    if (decal[t]) continue;
    const ids = [corners[t * 3], corners[t * 3 + 1], corners[t * 3 + 2]];
    const p = ids.map((id) => new Vector3().fromBufferAttribute(position, id));
    const control = Array.from({ length: 10 }, () => new Vector3());
    pnControlPoints(
      p,
      ids.map((id) => smooth[id]),
      control,
    );
    const normal = new Vector3().subVectors(p[2], p[1]).cross(new Vector3().subVectors(p[0], p[1]));
    if (normal.lengthSq() === 0) continue;
    surfaces.push({ p, control, normal: normal.normalize() });
  }
  return surfaces;
}

/** 점 바로 아래(1cm 이내) 면을 찾아, 그 면이 둥글어지며 움직인 만큼 점도 옮긴다. */
function liftOntoSurface(point: Vector3, normal: Vector3, surfaces: Surface[], strength: number) {
  const projected = new Vector3();
  const bary = new Vector3();
  let best: { surface: Surface; bary: Vector3; distance: number } | null = null;
  for (const surface of surfaces) {
    const offset = projected.subVectors(point, surface.p[0]).dot(surface.normal);
    const distance = Math.abs(offset);
    if (distance > 0.01 || (best && distance >= best.distance)) continue;
    projected.copy(point).addScaledVector(surface.normal, -offset);
    if (!barycentric(projected, surface.p, bary)) continue;
    best = { surface, bary: bary.clone(), distance };
  }
  if (!best) return;
  const { surface, bary: b } = best;
  const curved = evaluate(surface.control, b.x, b.y, b.z, new Vector3());
  const flat = new Vector3()
    .addScaledVector(surface.p[0], b.x)
    .addScaledVector(surface.p[1], b.y)
    .addScaledVector(surface.p[2], b.z);
  point.addScaledVector(curved.sub(flat), strength);
  // 깊이 정밀도 때문에 다시 묻히지 않게 면에서 아주 살짝 더 띄운다.
  point.addScaledVector(normal, 0.0005);
}

function barycentric(point: Vector3, p: Vector3[], out: Vector3) {
  const v0 = new Vector3().subVectors(p[1], p[0]);
  const v1 = new Vector3().subVectors(p[2], p[0]);
  const v2 = new Vector3().subVectors(point, p[0]);
  const d00 = v0.dot(v0);
  const d01 = v0.dot(v1);
  const d11 = v1.dot(v1);
  const d20 = v2.dot(v0);
  const d21 = v2.dot(v1);
  const denom = d00 * d11 - d01 * d01;
  if (denom === 0) return false;
  const v = (d11 * d20 - d01 * d21) / denom;
  const w = (d00 * d21 - d01 * d20) / denom;
  out.set(1 - v - w, v, w);
  const eps = -1e-3;
  return out.x >= eps && out.y >= eps && out.z >= eps;
}

/** 같은 위치(UV 이음매로 갈라진 꼭짓점 포함)의 면 법선을 넓이 가중 평균한다. */
function smoothNormals(position: BufferGeometry['attributes']['position'], corners: number[]) {
  const key = (i: number) => positionKey(position, i);
  const sums = new Map<string, Vector3>();
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  for (let t = 0; t < corners.length; t += 3) {
    a.fromBufferAttribute(position, corners[t]);
    b.fromBufferAttribute(position, corners[t + 1]);
    c.fromBufferAttribute(position, corners[t + 2]);
    // 외적의 길이가 넓이의 2배라 정규화하지 않고 더하면 넓이 가중이 된다.
    const face = new Vector3().subVectors(c, b).cross(new Vector3().subVectors(a, b));
    for (const corner of [corners[t], corners[t + 1], corners[t + 2]]) {
      const id = key(corner);
      const sum = sums.get(id);
      if (sum) sum.add(face);
      else sums.set(id, face.clone());
    }
  }
  return Array.from({ length: position.count }, (_, i) => {
    const sum = sums.get(key(i));
    return sum && sum.lengthSq() > 0 ? sum.clone().normalize() : new Vector3(0, 1, 0);
  });
}

/** PN 삼각형의 3차 베지어 제어점 10개: b300 b030 b003 b210 b120 b021 b012 b102 b201 b111 */
function pnControlPoints(p: Vector3[], n: Vector3[], out: Vector3[]) {
  const edge = (i: number, j: number, target: Vector3) => {
    const w = new Vector3().subVectors(p[j], p[i]).dot(n[i]);
    return target.copy(p[i]).multiplyScalar(2).add(p[j]).addScaledVector(n[i], -w).divideScalar(3);
  };
  out[0].copy(p[0]);
  out[1].copy(p[1]);
  out[2].copy(p[2]);
  edge(0, 1, out[3]);
  edge(1, 0, out[4]);
  edge(1, 2, out[5]);
  edge(2, 1, out[6]);
  edge(2, 0, out[7]);
  edge(0, 2, out[8]);
  const e = new Vector3();
  for (let k = 3; k < 9; k++) e.add(out[k]);
  e.divideScalar(6);
  const v = new Vector3().add(p[0]).add(p[1]).add(p[2]).divideScalar(3);
  out[9].copy(e).addScaledVector(new Vector3().subVectors(e, v), 0.5);
}

function evaluate(c: Vector3[], w: number, u: number, v: number, out: Vector3) {
  return out
    .set(0, 0, 0)
    .addScaledVector(c[0], w * w * w)
    .addScaledVector(c[1], u * u * u)
    .addScaledVector(c[2], v * v * v)
    .addScaledVector(c[3], 3 * w * w * u)
    .addScaledVector(c[4], 3 * w * u * u)
    .addScaledVector(c[5], 3 * u * u * v)
    .addScaledVector(c[6], 3 * u * v * v)
    .addScaledVector(c[7], 3 * w * v * v)
    .addScaledVector(c[8], 3 * w * w * v)
    .addScaledVector(c[9], 6 * w * u * v);
}

/** 세 꼭짓점의 뼈 가중치를 섞어 영향이 큰 뼈 4개만 남긴다. */
function blendSkin(
  skinIndex: BufferGeometry['attributes']['position'],
  skinWeight: BufferGeometry['attributes']['position'],
  ids: number[],
  bary: number[],
  joints: Uint16Array,
  weights: Float32Array,
  vertex: number,
) {
  const total = new Map<number, number>();
  for (let k = 0; k < 3; k++) {
    if (bary[k] === 0) continue;
    for (let s = 0; s < 4; s++) {
      const weight = skinWeight.getComponent(ids[k], s) * bary[k];
      if (weight <= 0) continue;
      const joint = skinIndex.getComponent(ids[k], s);
      total.set(joint, (total.get(joint) ?? 0) + weight);
    }
  }
  const top = [...total.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4);
  const sum = top.reduce((acc, [, weight]) => acc + weight, 0) || 1;
  top.forEach(([joint, weight], s) => {
    joints[vertex * 4 + s] = joint;
    weights[vertex * 4 + s] = weight / sum;
  });
}
