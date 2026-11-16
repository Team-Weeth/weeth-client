'use client';

import { createContext, useContext, useEffect } from 'react';
import { addAfterEffect, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import type { RefObject } from 'react';
import type { Object3D, PerspectiveCamera } from 'three';

/** 시안의 이름표 알약 높이(px). 안쪽 크기는 모두 이 높이에 대한 비율(em)로 잡는다. */
const PILL_PX = 23;
const em = (px: number) => `${px / PILL_PX}em`;

interface NameTagEntry {
  anchor: RefObject<Object3D | null>;
  element: HTMLDivElement;
  /** 장면에서의 알약 높이(m). 멀어질수록 작아지는 3D 크기 규칙은 그대로 둔다. */
  height: number;
  fontSize: number;
  shown: boolean;
}

/**
 * 이름표 DOM 레이어. 캔버스 텍스처로 그리면 장면 해상도(최대 1.75배)와 밉맵 축소 때문에 글자가 뭉개져,
 * 위치만 3D에서 계산하고 글자는 기기 해상도로 그리는 DOM에 맡긴다.
 */
export interface WaxNameTagRegistry {
  layer: HTMLDivElement | null;
  entries: Set<NameTagEntry>;
  /** 카메라에서 이름표까지(바닥 평면 x·z)를 불투명한 벽이 가리는지. 장면이 벽을 모은 뒤 채운다. */
  blocked: (fromX: number, fromZ: number, toX: number, toZ: number) => boolean;
}

export const WaxNameTagContext = createContext<RefObject<WaxNameTagRegistry> | null>(null);

function createNameTag(name: string, own: boolean) {
  const root = document.createElement('div');
  root.className = 'absolute top-0 left-0 leading-none will-change-transform';
  root.style.display = 'none';
  const pill = document.createElement('div');
  pill.className =
    'bg-container-neutral border-container-neutral-alternative text-text-strong flex items-center rounded-full border-solid whitespace-nowrap';
  Object.assign(pill.style, {
    height: '1em',
    borderWidth: em(1),
    paddingLeft: em(6),
    // 시안 피드백: 오른쪽만 2px 더 띄운다.
    paddingRight: em(8),
    gap: em(4),
  });
  if (own) {
    const badge = document.createElement('span');
    badge.className =
      'bg-container-primary text-text-inverse grid shrink-0 place-items-center rounded-full font-bold';
    badge.textContent = '나';
    // 배지 글자 크기(6px) 기준 em이라 지름 13px을 6으로 나눈다.
    Object.assign(badge.style, { fontSize: em(6), width: `${13 / 6}em`, height: `${13 / 6}em` });
    pill.append(badge);
  }
  const label = document.createElement('span');
  label.className = 'font-medium';
  label.style.fontSize = em(8);
  // 사용자가 정한 이름이라 HTML로 해석하지 않는다.
  label.textContent = name;
  pill.append(label);
  root.append(pill);
  return root;
}

/** 캐릭터 머리 위 anchor에 이름표를 붙인다. */
export function useWaxNameTag(
  anchor: RefObject<Object3D | null>,
  name: string,
  own: boolean,
  height: number,
) {
  const registry = useContext(WaxNameTagContext);
  useEffect(() => {
    const layer = registry?.current.layer;
    const entries = registry?.current.entries;
    if (!layer || !entries) return;
    const element = createNameTag(name, own);
    const entry: NameTagEntry = { anchor, element, height, fontSize: 0, shown: false };
    layer.append(element);
    entries.add(entry);
    return () => {
      entries.delete(entry);
      element.remove();
    };
  }, [registry, anchor, name, own, height]);
}

/**
 * 장면을 그린 뒤(카메라·캐릭터 위치가 확정된 뒤) 이름표를 화면 좌표로 옮긴다.
 * useFrame에서 옮기면 카메라보다 먼저 돌 때가 있어 한 프레임씩 밀려 흔들린다.
 */
export function WaxNameTagLayer() {
  const registry = useContext(WaxNameTagContext);
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  useEffect(() => {
    if (!registry) return;
    const world = new Vector3();
    const view = new Vector3();
    return addAfterEffect(() => {
      const { entries, blocked } = registry.current;
      const pixelsPerMeter = size.height / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
      for (const entry of entries) {
        const anchor = entry.anchor.current;
        let visible = Boolean(anchor);
        for (let node = anchor; node && visible; node = node.parent) visible = node.visible;
        if (visible && anchor) {
          anchor.getWorldPosition(world);
          const depth = -view.copy(world).applyMatrix4(camera.matrixWorldInverse).z;
          visible =
            depth > camera.near && !blocked(camera.position.x, camera.position.z, world.x, world.z);
          if (visible) {
            world.project(camera);
            const x = ((world.x + 1) / 2) * size.width;
            const y = ((1 - world.y) / 2) * size.height;
            // 글자 크기를 바꾸면 다시 배치되므로 0.25px 단위로만 바꾼다.
            const fontSize = Math.round(((entry.height * pixelsPerMeter) / depth) * 4) / 4;
            if (fontSize !== entry.fontSize) {
              entry.element.style.fontSize = `${fontSize}px`;
              entry.fontSize = fontSize;
            }
            entry.element.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
          }
        }
        if (visible !== entry.shown) {
          entry.element.style.display = visible ? '' : 'none';
          entry.shown = visible;
        }
      }
    });
  }, [registry, camera, size]);
  return null;
}
