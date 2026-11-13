'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  Quaternion,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { WAX_BALL_LOOKS } from '@/constants/wax';
import type { RefObject } from 'react';
import type { WaxFinish } from '@/constants/wax';

const RADIUS = 0.055;

export interface WaxHeldBallInput {
  crack: number;
  layer: number;
  smallCracks: number;
  bigCracks: number;
  pressing: boolean;
  /** 들켜서 교수님이 다가오는 동안 공을 책상 밑으로 내린다(교수님이 가려지지 않게). */
  lowered: boolean;
}

interface CrackSegment {
  from: [number, number];
  to: [number, number];
  threshold: number;
  width: number;
}

function seeded(seed: number) {
  let state = (seed * 9301 + 49297) % 233280;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * 응력선(금). 엄지가 누르는 정면 양옆에서 시작해 갈라져 퍼진다.
 * 구 UV에서 u=0.25가 정면(+z)이고 v=0.5가 적도다.
 */
function makeCracks(seed: number): CrackSegment[] {
  const random = seeded(seed);
  const segments: CrackSegment[] = [];
  const starts: [number, number][] = [
    [0.18, 0.45],
    [0.32, 0.45],
    [0.25, 0.3],
    [0.22, 0.62],
    [0.3, 0.6],
    [0.12, 0.4],
    [0.38, 0.38],
  ];
  starts.forEach(([su, sv], root) => {
    const branches = 2 + Math.floor(random() * 2);
    for (let b = 0; b < branches; b++) {
      let u = su;
      let v = sv;
      let angle = random() * Math.PI * 2;
      const steps = 5 + Math.floor(random() * 5);
      for (let i = 0; i < steps; i++) {
        const nu = u + Math.cos(angle) * (0.012 + random() * 0.018);
        const nv = Math.min(0.92, Math.max(0.08, v + Math.sin(angle) * (0.02 + random() * 0.03)));
        segments.push({
          from: [u, v],
          to: [nu, nv],
          threshold: Math.min(0.97, (root / starts.length) * 0.75 + (i / steps) * 0.3),
          width: 1.4 + random() * 1.2,
        });
        u = nu;
        v = nv;
        angle += (random() - 0.5) * 1.4;
      }
    }
  });
  return segments.sort((a, b) => a.threshold - b.threshold);
}

/**
 * 진행도에 맞춰 두 장을 그린다. glow: 하얗게 일어나는 응력선(발광 맵),
 * alpha: 진행 후반에 금 끝부분의 껍질이 떨어져 나간 구멍(검정 = 구멍).
 */
function drawCracks(
  glow: CanvasRenderingContext2D,
  alpha: CanvasRenderingContext2D,
  segments: CrackSegment[],
  progress: number,
) {
  const { width, height } = glow.canvas;
  glow.fillStyle = '#000000';
  glow.fillRect(0, 0, width, height);
  alpha.fillStyle = '#ffffff';
  alpha.fillRect(0, 0, width, height);
  glow.lineCap = 'round';
  for (const segment of segments) {
    if (segment.threshold > progress) break;
    const age = progress - segment.threshold;
    const [x0, y0] = [segment.from[0] * width, segment.from[1] * height];
    const [x1, y1] = [segment.to[0] * width, segment.to[1] * height];
    glow.strokeStyle = `rgba(255,255,255,${Math.min(1, 0.45 + age * 2)})`;
    glow.lineWidth = segment.width + age * 4;
    glow.beginPath();
    glow.moveTo(x0, y0);
    glow.lineTo(x1, y1);
    glow.stroke();
    // 오래된 금부터 가장자리가 들떠 작은 조각이 떨어진다.
    if (age > 0.28) {
      alpha.fillStyle = '#000000';
      alpha.beginPath();
      alpha.ellipse(
        x1,
        y1,
        2 + (age - 0.28) * 22,
        1.5 + (age - 0.28) * 14,
        Math.atan2(y1 - y0, x1 - x0),
        0,
        Math.PI * 2,
      );
      alpha.fill();
    }
  }
}

/** 왁스를 여러 번 찍어 바른 표면처럼 고르지 않게 만든 구. 아래쪽에는 흘러내린 방울 자국이 있다. */
function waxGeometry(seed: number, radius: number) {
  const geometry = new SphereGeometry(radius, 72, 54);
  const noise = new SimplexNoise({ random: seeded(seed) });
  const position = geometry.getAttribute('position');
  const point = new Vector3();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i);
    const n = point.clone().normalize();
    const lumps = noise.noise3d(n.x * 1.4, n.y * 1.4, n.z * 1.4) * 0.026;
    const ripples = noise.noise3d(n.x * 4, n.y * 4, n.z * 4) * 0.004;
    const drips =
      n.y < -0.55
        ? Math.max(0, noise.noise3d(n.x * 3.2, 0.4, n.z * 3.2)) * (-n.y - 0.55) * 0.12
        : 0;
    point.copy(n).multiplyScalar(radius * (1 + lumps + ripples + drips));
    position.setXYZ(i, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** 마감별 질감 지도. 마블은 소용돌이, 글리터는 반짝이 점. */
function finishMap(finish: WaxFinish, base: string, seed: number) {
  if (finish !== 'marble' && finish !== 'glitter') return null;
  const element = document.createElement('canvas');
  element.width = 512;
  element.height = 256;
  const context = element.getContext('2d');
  if (!context) return null;
  const random = seeded(seed);
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 512, 256);
  if (finish === 'marble') {
    context.strokeStyle = new Color(base).offsetHSL(0, 0, -0.15).getStyle();
    for (let i = 0; i < 9; i++) {
      context.lineWidth = 6 + random() * 18;
      context.globalAlpha = 0.35 + random() * 0.4;
      context.beginPath();
      let y = random() * 256;
      context.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) {
        y += (random() - 0.5) * 40;
        context.lineTo(x, y);
      }
      context.stroke();
    }
  } else {
    for (let i = 0; i < 900; i++) {
      context.fillStyle = random() < 0.5 ? '#ffffff' : '#d9c7ff';
      context.globalAlpha = 0.5 + random() * 0.5;
      context.fillRect(random() * 512, random() * 256, 2, 2);
    }
  }
  const texture = new CanvasTexture(element);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function finishMaterial(finish: WaxFinish) {
  switch (finish) {
    case 'gloss':
      return { roughness: 0.28, clearcoat: 0.5, clearcoatRoughness: 0.2 };
    case 'pearl':
      return { roughness: 0.32, clearcoat: 0.4, iridescence: 0.6, iridescenceIOR: 1.5 };
    case 'glitter':
      return { roughness: 0.38, clearcoat: 0.4, metalness: 0.1 };
    case 'marble':
      return { roughness: 0.34, clearcoat: 0.4, clearcoatRoughness: 0.25 };
    default:
      return { roughness: 0.62, clearcoat: 0.05 };
  }
}

interface Shard {
  mesh: Mesh<BufferGeometry, MeshPhysicalMaterial>;
  velocity: Vector3;
  spin: Vector3;
}

/** 정이십면체 면을 구면에 붙인 얇은 껍질 조각. */
function makeShardGeometries() {
  const base = new IcosahedronGeometry(RADIUS * 1.02, 1);
  const position = base.getAttribute('position');
  const geometries: { geometry: BufferGeometry; center: Vector3 }[] = [];
  for (let i = 0; i < position.count; i += 3) {
    const corners = [0, 1, 2].map((k) => new Vector3().fromBufferAttribute(position, i + k));
    const center = corners[0].clone().add(corners[1]).add(corners[2]).divideScalar(3);
    const vertices = corners.flatMap((point) =>
      point
        .clone()
        .setLength(RADIUS * 1.02)
        .sub(center)
        .toArray(),
    );
    const normals = corners.flatMap((point) => point.clone().normalize().toArray());
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    geometries.push({ geometry, center });
  }
  base.dispose();
  return geometries;
}

/** React Compiler가 상태 객체 변경으로 오인하지 않도록 텍스처 갱신을 함수로 분리한다. */
function markDirty(...textures: CanvasTexture[]) {
  for (const texture of textures) texture.needsUpdate = true;
}

function canvas2d(width: number, height: number) {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  return { context: element.getContext('2d'), texture: new CanvasTexture(element) };
}

/** 착석 시 책상 밑에서 올라와 화면 가운데 아래에 떠 있는 왁뿌볼. 손 없이 공만 보여 공에 집중하게 한다. */
export function WaxHeldBall({
  variant,
  input,
  onPressStart,
}: {
  variant: number;
  input: RefObject<WaxHeldBallInput>;
  onPressStart: () => void;
}) {
  const look = WAX_BALL_LOOKS[variant % WAX_BALL_LOOKS.length];
  const stack = [...look.layers, look.core];
  const { camera, scene } = useThree();
  const root = useRef<Group>(null);
  const ball = useRef<Group>(null);
  const shell = useRef<Mesh<BufferGeometry, MeshPhysicalMaterial>>(null);
  const inner = useRef<Mesh<BufferGeometry, MeshPhysicalMaterial>>(null);
  const [maps] = useState(() => ({ glow: canvas2d(512, 256), alpha: canvas2d(512, 256) }));
  const [shapes] = useState(() => ({
    outer: waxGeometry(variant * 7 + 1, RADIUS),
    inner: waxGeometry(variant * 7 + 3, RADIUS * 0.95),
  }));
  const [surface] = useState(() => finishMap(look.finish, look.layers[0], variant + 11));
  const [shardGeometries] = useState(makeShardGeometries);
  const shards = useRef<Shard[]>([]);
  const memory = useRef({
    layer: -1,
    small: -1,
    big: -1,
    bucket: -1,
    squeeze: 0,
    shake: 0,
    appear: 0,
    lower: 0,
    cracks: makeCracks(variant + 1),
  });

  useEffect(() => {
    const flying = shards.current;
    return () => {
      maps.glow.texture.dispose();
      maps.alpha.texture.dispose();
      shapes.outer.dispose();
      shapes.inner.dispose();
      surface?.dispose();
      shardGeometries.forEach((entry) => entry.geometry.dispose());
      flying.forEach((shard) => {
        shard.mesh.removeFromParent();
        shard.mesh.material.dispose();
      });
    };
  }, [maps, shapes, surface, shardGeometries]);

  function burst(color: string) {
    const group = ball.current;
    if (!group) return;
    const origin = group.getWorldPosition(new Vector3());
    const quaternion = group.getWorldQuaternion(new Quaternion());
    const forward = camera.getWorldDirection(new Vector3());
    // 한꺼번에 다 떨어지지 않고 앞쪽 껍질 일부가 조각나 떨어진다.
    for (const { geometry, center } of shardGeometries) {
      if (center.z < -RADIUS * 0.3 || Math.random() < 0.35) continue;
      const material = new MeshPhysicalMaterial({
        color,
        roughness: 0.4,
        clearcoat: 0.6,
        side: DoubleSide,
        transparent: true,
      });
      const mesh = new Mesh(geometry, material);
      const offset = center.clone().applyQuaternion(quaternion);
      mesh.position.copy(origin).add(offset);
      mesh.quaternion.copy(quaternion);
      mesh.scale.setScalar(0.6 + Math.random() * 0.5);
      scene.add(mesh);
      const velocity = offset
        .clone()
        .normalize()
        .multiplyScalar(0.18 + Math.random() * 0.25)
        .add(new Vector3(0, 0.12, 0));
      // 카메라 쪽으로 날아오면 화면을 가리므로 그 성분은 반대로 돌린다.
      const toward = velocity.dot(forward);
      if (toward < 0) velocity.addScaledVector(forward, -2 * toward);
      shards.current.push({
        mesh,
        velocity,
        spin: new Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5,
        ).multiplyScalar(12),
      });
    }
  }

  useFrame((_, delta) => {
    const group = root.current;
    const current = input.current;
    const state = memory.current;
    if (!group || !current) return;
    // 앉는 순간 책상 밑에서 올라온다. 카메라에 붙여 화면 아래 가운데, 책상 모서리보다 가까이 둔다.
    state.appear = Math.min(1, state.appear + delta / 0.5);
    state.lower = MathUtils.damp(state.lower, current.lowered ? 1 : 0, 6, delta);
    const rise = 1 - (1 - state.appear) ** 3;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);
    group.translateZ(-0.3);
    group.translateY(-0.062 - (1 - rise) * 0.18 - state.lower * 0.2);
    group.scale.setScalar((0.7 + rise * 0.3) * 1.12);
    group.visible = state.lower < 0.98;

    if (state.layer !== current.layer) {
      if (state.layer >= 0) burst(stack[state.layer % stack.length]);
      state.layer = current.layer;
      shell.current?.material.color.set(stack[current.layer % stack.length]);
      inner.current?.material.color.set(stack[(current.layer + 1) % stack.length]);
      state.cracks = makeCracks(variant * 31 + current.layer + 1);
      state.bucket = -1;
    }
    if (state.small !== current.smallCracks) {
      if (state.small >= 0) state.shake = 1;
      state.small = current.smallCracks;
    }
    if (state.big !== current.bigCracks) {
      if (state.big >= 0) state.shake = 1.6;
      state.big = current.bigCracks;
    }
    // 진행도를 4% 단위로만 다시 그린다.
    const bucket = Math.round(current.crack / 4);
    if (bucket !== state.bucket && maps.glow.context && maps.alpha.context) {
      state.bucket = bucket;
      drawCracks(maps.glow.context, maps.alpha.context, state.cracks, current.crack / 100);
      markDirty(maps.glow.texture, maps.alpha.texture);
    }
    state.squeeze = MathUtils.damp(
      state.squeeze,
      current.pressing ? 1 : 0,
      current.pressing ? 14 : 8,
      delta,
    );
    state.shake = Math.max(0, state.shake - delta * 4);
    const s = state.squeeze;
    const body = ball.current;
    if (body) {
      // 누르면 가로로 눌리고 앞뒤·위로 살짝 부푼다.
      body.scale.set(1 - s * 0.08, 1 + s * 0.04, 1 + s * 0.05);
      const t = performance.now() / 1000;
      body.position.x = Math.sin(t * 60) * 0.003 * state.shake;
      body.position.y = Math.sin(t * 1.6) * 0.002;
      body.rotation.z = Math.sin(t * 45) * 0.05 * state.shake;
    }

    const gravity = -2.4;
    shards.current = shards.current.filter((shard) => {
      shard.velocity.y += gravity * delta;
      shard.mesh.position.addScaledVector(shard.velocity, delta);
      shard.mesh.rotation.x += shard.spin.x * delta;
      shard.mesh.rotation.y += shard.spin.y * delta;
      shard.mesh.material.opacity -= delta * 0.9;
      if (shard.mesh.material.opacity > 0) return true;
      shard.mesh.removeFromParent();
      shard.mesh.material.dispose();
      return false;
    });
  });

  const material = finishMaterial(look.finish);
  return (
    <group ref={root} renderOrder={10}>
      <group
        ref={ball}
        onPointerDown={(event) => {
          event.stopPropagation();
          onPressStart();
        }}
      >
        {/* 다음 겹(마지막에는 말랑한 속) */}
        <mesh ref={inner} geometry={shapes.inner}>
          <meshPhysicalMaterial color={stack[1]} roughness={0.5} sheen={0.6} />
        </mesh>
        {/* 지금 겹: 응력선은 발광 맵으로 하얗게, 떨어진 조각은 알파 구멍으로 */}
        <mesh ref={shell} geometry={shapes.outer}>
          <meshPhysicalMaterial
            color={stack[0]}
            map={surface}
            {...material}
            envMapIntensity={0.5}
            emissive="#ffffff"
            emissiveMap={maps.glow.texture}
            emissiveIntensity={0.45}
            alphaMap={maps.alpha.texture}
            alphaTest={0.5}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
