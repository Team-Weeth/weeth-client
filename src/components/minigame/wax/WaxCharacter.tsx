'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AnimationMixer,
  Box3,
  CylinderGeometry,
  Group,
  LoopOnce,
  LoopRepeat,
  MathUtils,
  Mesh,
  MeshLambertMaterial,
  Sprite,
  Vector3,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { bubbleTexture, nameTagTexture } from '@/components/minigame/wax/waxTextures';
import {
  WAX_BALL_LOOKS,
  WAX_CHARACTERS,
  WAX_EMOTES,
  WAX_SCENE,
  WAX_STUDENT_HEIGHT,
  waxCharacterUrl,
} from '@/constants/wax';
import type { RefObject } from 'react';
import type { AnimationAction, AnimationClip, Object3D, Texture } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { WaxEmoteKind } from '@/types/wax';

export type WaxAnimation =
  | 'idle'
  | 'walk'
  | 'sprint'
  | 'sit'
  | 'interact-right'
  | 'attack-melee-right'
  | 'holding-both'
  | 'die'
  | 'jump'
  | 'crouch'
  | 'emote-yes'
  | 'emote-no';

/** 머리 위 말풍선. 상태 표시('!' 등) 또는 플레이어가 보낸 표현이다. */
export type WaxBubble = '!' | '딱!' | '흠…' | WaxEmoteKind;

export interface WaxPose {
  x: number;
  z: number;
  yaw: number;
  y?: number;
  animation: WaxAnimation;
  /** 손에 든 왁뿌볼 종류 */
  holding?: number | null;
  bubble?: WaxBubble | null;
  visible?: boolean;
}

const models = new Map<string, Promise<GLTF>>();

function loadCharacter(character: string) {
  let promise = models.get(character);
  if (!promise) {
    promise = new GLTFLoader().loadAsync(waxCharacterUrl(character));
    models.set(character, promise);
  }
  return promise;
}

/** 게임에 쓰는 캐릭터 GLB를 미리 받는다. 시작 버튼은 이 준비가 끝난 뒤 활성화한다. */
export function preloadWaxCharacters() {
  return Promise.all(WAX_CHARACTERS.map(loadCharacter));
}

/** Kenney Mini Characters는 스킨드 메시라 뼈대까지 복제해야 인스턴스마다 따로 움직인다. */
function prepare(gltf: GLTF, height: number) {
  const model = cloneSkinned(gltf.scene);
  model.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
    }
  });
  // 원본 팔이 몸에 비해 길어 보여 팔 뼈를 줄인다. 애니메이션은 회전만 바꾸므로 크기는 유지된다.
  for (const side of ['arm-left', 'arm-right']) model.getObjectByName(side)?.scale.setScalar(0.78);
  const size = new Box3().setFromObject(model).getSize(new Vector3()).y || 1;
  const scale = height / size;
  model.scale.setScalar(scale);
  return { model, scale };
}

function NameTag({ name, own, height }: { name: string; own: boolean; height: number }) {
  const [tag] = useState(() => nameTagTexture(name, own));
  useEffect(() => () => tag.texture.dispose(), [tag]);
  return (
    <sprite position={[0, height + 0.2, 0]} scale={[0.2 * tag.aspect, 0.2, 1]} renderOrder={20}>
      <spriteMaterial map={tag.texture} depthWrite={false} transparent />
    </sprite>
  );
}

const BUBBLES: Record<WaxBubble, { text: string; color: string }> = {
  '!': { text: '!', color: '#e53935' },
  '딱!': { text: '딱!', color: '#d84315' },
  '흠…': { text: '흠…', color: '#37474f' },
  ...(Object.fromEntries(
    WAX_EMOTES.map((emote) => [emote.kind, { text: emote.bubble, color: emote.color }]),
  ) as Record<WaxEmoteKind, { text: string; color: string }>),
};

let bubbleTextures: Record<string, Texture> | null = null;

/** 말풍선 텍스처는 캐릭터마다 만들지 않고 한 벌을 함께 쓴다(최대 27명 × 8종이면 GPU 메모리가 크다). */
function sharedBubbleTextures() {
  bubbleTextures ??= Object.fromEntries(
    Object.entries(BUBBLES).map(([key, { text, color }]) => [key, bubbleTexture(text, color)]),
  );
  return bubbleTextures;
}

function Bubble({ group, height }: { group: RefObject<Sprite | null>; height: number }) {
  const [textures] = useState(sharedBubbleTextures);
  return (
    <sprite
      ref={group}
      position={[0, height + 0.7, 0]}
      scale={[0.55, 0.55, 1]}
      visible={false}
      renderOrder={21}
      userData={{ textures }}
    >
      <spriteMaterial depthWrite={false} transparent />
    </sprite>
  );
}

/** 둥근 치비 캐릭터(Kenney Mini Characters). 위치는 매 프레임 pose()에서 읽는다. */
export function WaxCharacter({
  character,
  name,
  own = false,
  height = WAX_STUDENT_HEIGHT,
  smooth = true,
  pose,
  rod = false,
}: {
  character: string;
  name?: string;
  own?: boolean;
  height?: number;
  smooth?: boolean;
  pose: () => WaxPose | null;
  rod?: boolean;
}) {
  const root = useRef<Group>(null);
  const bubble = useRef<Sprite>(null);
  const ball = useRef<Mesh>(null);
  const [rig, setRig] = useState<{
    model: Object3D;
    mixer: AnimationMixer;
    actions: Map<string, AnimationAction>;
    hand: Object3D | null;
    scale: number;
  } | null>(null);
  const current = useRef<string>('');
  const initialized = useRef(false);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void loadCharacter(character).then((gltf) => {
      if (disposed) return;
      const { model, scale } = prepare(gltf, height);
      const mixer = new AnimationMixer(model);
      const actions = new Map(
        gltf.animations.map((clip: AnimationClip) => [clip.name, mixer.clipAction(clip)]),
      );
      for (const once of ['attack-melee-right', 'die']) {
        const action = actions.get(once);
        if (action) action.setLoop(LoopOnce, 1).clampWhenFinished = true;
      }
      setRig({ model, mixer, actions, hand: model.getObjectByName('arm-right') ?? null, scale });
      cleanup = () => mixer.stopAllAction();
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [character, height]);

  useFrame((_, delta) => {
    const group = root.current;
    const next = pose();
    if (!group || !next) return;
    group.visible = next.visible !== false;
    const y = next.y ?? 0;
    if (!initialized.current || !smooth) {
      group.position.set(next.x, y, next.z);
      group.rotation.y = next.yaw;
      initialized.current = true;
    } else {
      group.position.x = MathUtils.damp(group.position.x, next.x, 12, delta);
      group.position.z = MathUtils.damp(group.position.z, next.z, 12, delta);
      group.position.y = MathUtils.damp(group.position.y, y, 12, delta);
      // 가장 짧은 방향으로 회전한다.
      const diff = Math.atan2(
        Math.sin(next.yaw - group.rotation.y),
        Math.cos(next.yaw - group.rotation.y),
      );
      group.rotation.y += diff * (1 - Math.exp(-14 * delta));
    }
    if (rig) {
      if (current.current !== next.animation) {
        const action = rig.actions.get(next.animation);
        const previous = rig.actions.get(current.current);
        if (action) {
          action.reset();
          if (next.animation !== 'attack-melee-right' && next.animation !== 'die')
            action.setLoop(LoopRepeat, Infinity);
          action.fadeIn(0.18).play();
          previous?.fadeOut(0.18);
          current.current = next.animation;
        }
      }
      rig.mixer.update(delta);
    }
    if (ball.current) {
      ball.current.visible = next.holding != null;
      if (next.holding != null) {
        const look = WAX_BALL_LOOKS[next.holding % WAX_BALL_LOOKS.length];
        (ball.current.material as MeshLambertMaterial).color.set(look.layers[0]);
      }
    }
    if (bubble.current) {
      bubble.current.visible = Boolean(next.bubble);
      if (next.bubble) {
        const textures = bubble.current.userData.textures as Record<string, Texture>;
        if (bubble.current.material.map !== textures[next.bubble]) {
          bubble.current.material.map = textures[next.bubble];
          bubble.current.material.needsUpdate = true;
        }
        bubble.current.position.y = height + 0.7 + Math.sin(performance.now() / 120) * 0.03;
      }
    }
  });

  return (
    <group ref={root}>
      {rig && <primitive object={rig.model} />}
      {rig?.hand && rod && <RodAttachment hand={rig.hand} scale={rig.scale} />}
      {/* 앉아서 무릎 위에 쥔 왁뿌볼 */}
      <mesh ref={ball} position={[0, height * 0.42, 0.2]} visible={false} castShadow>
        <sphereGeometry args={[0.075, 20, 14]} />
        <meshLambertMaterial color={WAX_SCENE.skin} />
      </mesh>
      {name && <NameTag name={name} own={own} height={height} />}
      <Bubble group={bubble} height={height} />
    </group>
  );
}

/** 교수님 오른손의 회초리. 팔 뼈에 붙여 휘두르는 애니메이션을 따라간다. 크기는 미터 단위로 맞춘다. */
function RodAttachment({ hand, scale }: { hand: Object3D; scale: number }) {
  useEffect(() => {
    const holder = new Group();
    // 뼈 좌표는 모델 단위(키 약 0.75)라 미터로 되돌린다.
    holder.scale.setScalar(1 / scale);
    const geometry = new CylinderGeometry(0.018, 0.028, 0.95, 6);
    const material = new MeshLambertMaterial({ color: WAX_SCENE.rod });
    const rod = new Mesh(geometry, material);
    rod.rotation.x = Math.PI / 2.4;
    rod.position.set(-0.04, -0.2, 0.42);
    rod.castShadow = true;
    holder.add(rod);
    hand.add(holder);
    return () => {
      hand.remove(holder);
      geometry.dispose();
      material.dispose();
    };
  }, [hand, scale]);
  return null;
}
