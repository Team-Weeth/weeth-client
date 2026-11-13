'use client';

import { useEffect, useState } from 'react';
import {
  buildingSignTexture,
  ceilingTexture,
  directoryTexture,
  emblemTexture,
  posterTexture,
  signTexture,
  tileFloorTexture,
  vendingTexture,
  whiteboardTexture,
} from '@/components/minigame/wax/waxTextures';
import { hallFurniture, roomFurniture, WAX_WALL_HEIGHT } from '@/lib/minigame/waxCollision';
import { WAX_ROOM_THEMES, WAX_SCENE } from '@/constants/wax';
import type { Texture } from 'three';
import type { WaxRoomProp } from '@/constants/wax';
import type { WaxLayout, WaxRoom, WaxSeat } from '@/types/wax';

type Vec3 = [number, number, number];

/** 카메라와 캐릭터 사이를 가리면 반투명해지는 벽 레이어. */
export const WAX_BLOCK_LAYER = 1;

const H = WAX_WALL_HEIGHT;
const T = 0.2;

function Box({
  position,
  size,
  color,
  block = false,
  shadow = true,
  map,
  emissive,
  opacity,
  rotation,
}: {
  position: Vec3;
  size: Vec3;
  color: string;
  block?: boolean;
  shadow?: boolean;
  map?: Texture;
  emissive?: string;
  opacity?: number;
  rotation?: Vec3;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow={shadow}
      receiveShadow
      onUpdate={(mesh) => {
        if (block) mesh.layers.enable(WAX_BLOCK_LAYER);
      }}
      userData={{ baseOpacity: opacity ?? 1 }}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        map={map}
        roughness={0.85}
        emissive={emissive}
        emissiveIntensity={emissive ? 1 : 0}
        transparent={opacity !== undefined}
        opacity={opacity ?? 1}
      />
    </mesh>
  );
}

/** 텍스처를 한 번 만들고 언마운트 시 정리한다. */
function useTexture(factory: () => Texture) {
  const [texture] = useState(factory);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Plane({
  position,
  size,
  map,
  rotation = [-Math.PI / 2, 0, 0],
  roughness = 0.9,
}: {
  position: Vec3;
  size: [number, number];
  map: Texture;
  rotation?: Vec3;
  roughness?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial map={map} roughness={roughness} />
    </mesh>
  );
}

/**
 * x축 방향 벽에 창문 구멍을 낸다. 창틀·유리는 구멍 안에 둔다.
 * axis='x'면 벽이 x축을 따라 뻗고, 'z'면 z축을 따라 뻗는다.
 */
function WindowedWall({
  axis,
  from,
  to,
  at,
  windows,
  color = WAX_SCENE.wall,
  blinds = false,
}: {
  axis: 'x' | 'z';
  from: number;
  to: number;
  at: number;
  windows: number[];
  color?: string;
  /** 교실 창문 위쪽에 반쯤 내린 블라인드 */
  blinds?: boolean;
}) {
  const sill = 1.0;
  const top = 3.6;
  const width = 2.0;
  const place = (
    along: number,
    y: number,
    length: number,
    height: number,
    thickness = T,
  ): { position: Vec3; size: Vec3 } =>
    axis === 'x'
      ? { position: [along, y, at], size: [length, height, thickness] }
      : { position: [at, y, along], size: [thickness, height, length] };
  const pieces: { position: Vec3; size: Vec3 }[] = [
    place((from + to) / 2, sill / 2, to - from, sill),
    place((from + to) / 2, (top + H) / 2, to - from, H - top),
  ];
  const edges = [
    from,
    ...windows.flatMap((center) => [center - width / 2, center + width / 2]),
    to,
  ];
  for (let i = 0; i < edges.length; i += 2) {
    const length = edges[i + 1] - edges[i];
    if (length > 0.01)
      pieces.push(place(edges[i] + length / 2, (sill + top) / 2, length, top - sill));
  }
  return (
    <group>
      {pieces.map((piece, i) => (
        <Box key={i} {...piece} color={color} block />
      ))}
      {windows.map((center) => (
        <group key={center}>
          <Box
            {...place(center, (sill + top) / 2, width, top - sill, 0.04)}
            color={WAX_SCENE.glass}
            opacity={0.28}
            shadow={false}
            block
          />
          <Box
            {...place(center, (sill + top) / 2, 0.06, top - sill, 0.12)}
            color={WAX_SCENE.windowFrame}
            block
          />
          <Box
            {...place(center, (sill + top) / 2, width, 0.06, 0.12)}
            color={WAX_SCENE.windowFrame}
            block
          />
          <Box
            {...place(center, sill + 0.035, width + 0.1, 0.06, 0.3)}
            color={WAX_SCENE.windowFrame}
            block
          />
          {blinds &&
            [0, 1, 2, 3, 4].map((i) => (
              <Box
                key={`blind-${i}`}
                {...place(center, top - 0.08 - i * 0.09, width - 0.04, 0.05, 0.02)}
                color="#fafafa"
                shadow={false}
                block
              />
            ))}
        </group>
      ))}
    </group>
  );
}

/** 아래를 향한 면만 있어 위에서 내려다보는 카메라에는 보이지 않는다. */
function CeilingLight({ position }: { position: Vec3 }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.2, 0.5]} />
      <meshStandardMaterial color={WAX_SCENE.light} emissive="#fffbe8" emissiveIntensity={1} />
    </mesh>
  );
}

/** 복도 천장의 긴 형광등(2줄). 복도를 가로지르는 방향(z)으로 길다. */
function HallLight({ position, length }: { position: Vec3; length: number }) {
  return (
    <group position={position}>
      {[-0.13, 0.13].map((dx) => (
        <mesh key={dx} position={[dx, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, length]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.3} />
        </mesh>
      ))}
    </group>
  );
}

/** 한국 대학 강의실의 일체형 책걸상. 학생은 화이트보드(-z)를 보고 앉고, 책상판은 오른쪽(+x)에서 앞으로 나온다. */
function Desk({ seat, color }: { seat: WaxSeat; color: string }) {
  const legs: [number, number][] = [
    [-0.19, -0.17],
    [0.19, -0.17],
    [-0.19, 0.17],
    [0.19, 0.17],
  ];
  return (
    <group position={[seat.x, 0, seat.z]}>
      <Box position={[0, 0.45, 0]} size={[0.46, 0.05, 0.44]} color={color} />
      <Box position={[0, 0.76, 0.22]} size={[0.46, 0.4, 0.05]} color={color} />
      {legs.map(([x, z], i) => (
        <Box key={i} position={[x, 0.22, z]} size={[0.035, 0.44, 0.035]} color={WAX_SCENE.metal} />
      ))}
      {/* 의자 밑 책 받침 */}
      <Box
        position={[0, 0.16, 0.02]}
        size={[0.38, 0.02, 0.34]}
        color={WAX_SCENE.metal}
        shadow={false}
      />
      {/* 오른쪽 팔걸이 기둥과 책상판 */}
      <Box position={[0.25, 0.6, 0.02]} size={[0.04, 0.32, 0.04]} color={WAX_SCENE.metal} />
      <Box
        position={[0.12, 0.75, -0.26]}
        size={[0.4, 0.03, 0.52]}
        color={WAX_SCENE.deskTop}
        rotation={[0, -0.12, 0]}
      />
      <Box
        position={[0.08, 0.77, -0.3]}
        size={[0.2, 0.01, 0.15]}
        color="#ffffff"
        rotation={[0, 0.1, 0]}
        shadow={false}
      />
    </group>
  );
}

interface PropSlot {
  x: number;
  z: number;
  width: number;
  depth: number;
}

/** 과목별 소품. 자리(slot)는 충돌 판정과 같은 값이다. */
function RoomProps({
  kind,
  corner,
  side,
  accent,
}: {
  kind: WaxRoomProp;
  corner: PropSlot;
  side: PropSlot;
  accent: string;
}) {
  if (kind === 'lab')
    return (
      <>
        {/* 왼쪽 벽: 비커가 놓인 실험대 */}
        <group position={[side.x, 0, side.z]}>
          <Box position={[0, 0.45, 0]} size={[side.width, 0.9, side.depth]} color="#e8eef2" />
          <Box
            position={[0, 0.92, 0]}
            size={[side.width + 0.04, 0.04, side.depth + 0.04]}
            color="#37474f"
          />
          {[-1.1, -0.55, 0, 0.6, 1.1].map((z, i) => (
            <mesh key={z} position={[0, 1.04 + (i % 2) * 0.03, z]} castShadow>
              <cylinderGeometry args={[0.06, 0.07, 0.2 + (i % 2) * 0.06, 12]} />
              <meshPhysicalMaterial
                color={['#80deea', '#f48fb1', '#fff59d', '#a5d6a7', '#b39ddb'][i]}
                roughness={0.1}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>
        {/* 앞쪽 구석: 인체 모형과 주기율표 */}
        <group position={[corner.x, 0, corner.z]}>
          <Box position={[0, 0.05, 0]} size={[0.5, 0.1, 0.5]} color="#5d4037" />
          <Box position={[0, 0.75, 0]} size={[0.06, 1.3, 0.06]} color="#bdbdbd" />
          <mesh position={[0, 1.55, 0]} castShadow>
            <sphereGeometry args={[0.16, 14, 10]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          {[1.25, 1.12, 0.99, 0.86].map((y) => (
            <Box
              key={y}
              position={[0, y, 0]}
              size={[0.36 - (1.25 - y) * 0.4, 0.03, 0.18]}
              color="#fafafa"
            />
          ))}
          <Box
            position={[0.35, 1.0, -corner.depth / 2 + 0.05]}
            size={[0.6, 0.45, 0.02]}
            color={accent}
          />
        </group>
      </>
    );
  if (kind === 'art')
    return (
      <>
        {/* 왼쪽 벽: 이젤 두 개 */}
        {[-0.8, 0.8].map((dz, i) => (
          <group key={dz} position={[side.x, 0, side.z + dz]} rotation={[0, Math.PI / 2, 0]}>
            <Box
              position={[0, 0.7, 0.1]}
              size={[0.05, 1.4, 0.05]}
              color="#8d6e63"
              rotation={[0.18, 0, 0]}
            />
            <Box
              position={[-0.28, 0.7, -0.05]}
              size={[0.05, 1.4, 0.05]}
              color="#8d6e63"
              rotation={[-0.08, 0, 0.12]}
            />
            <Box
              position={[0.28, 0.7, -0.05]}
              size={[0.05, 1.4, 0.05]}
              color="#8d6e63"
              rotation={[-0.08, 0, -0.12]}
            />
            <Box position={[0, 1.05, -0.08]} size={[0.62, 0.48, 0.03]} color="#fffdf5" />
            <Box
              position={[i ? 0.08 : -0.1, 1.08, -0.1]}
              size={[0.24, 0.18, 0.01]}
              color={i ? '#ff8a65' : '#64b5f6'}
              shadow={false}
            />
            <Box
              position={[i ? -0.12 : 0.12, 0.98, -0.1]}
              size={[0.18, 0.12, 0.01]}
              color={i ? '#ffd54f' : '#81c784'}
              shadow={false}
            />
          </group>
        ))}
        {/* 앞쪽 구석: 받침대 위 석고상 */}
        <group position={[corner.x, 0, corner.z]}>
          <Box position={[0, 0.5, 0]} size={[0.5, 1.0, 0.5]} color="#f5f5f5" />
          <Box position={[0, 1.12, 0]} size={[0.26, 0.24, 0.2]} color="#eeeeee" />
          <mesh position={[0, 1.38, 0]} castShadow>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshStandardMaterial color="#fafafa" roughness={0.9} />
          </mesh>
          <Box position={[0.5, 0.03, 0.3]} size={[0.5, 0.02, 0.4]} color={accent} shadow={false} />
        </group>
      </>
    );
  return (
    <>
      {/* 왼쪽 벽: 보면대 세 개 */}
      {[-1.0, 0, 1.0].map((dz) => (
        <group key={dz} position={[side.x, 0, side.z + dz]}>
          <Box position={[0, 0.6, 0]} size={[0.04, 1.2, 0.04]} color="#263238" />
          <Box
            position={[0.04, 1.2, 0]}
            size={[0.02, 0.3, 0.42]}
            color="#263238"
            rotation={[0, 0, -0.35]}
          />
          <Box
            position={[0.06, 1.22, 0]}
            size={[0.01, 0.26, 0.36]}
            color="#fffde7"
            rotation={[0, 0, -0.35]}
            shadow={false}
          />
        </group>
      ))}
      {/* 앞쪽 구석: 업라이트 피아노 */}
      <group position={[corner.x, 0, corner.z]} rotation={[0, -Math.PI / 2, 0]}>
        <Box position={[0, 0.65, -0.1]} size={[1.4, 1.3, 0.55]} color="#1b1b1f" />
        <Box position={[0, 0.78, 0.25]} size={[1.3, 0.06, 0.25]} color="#fafafa" />
        {Array.from({ length: 9 }, (_, i) => (
          <Box
            key={i}
            position={[-0.56 + i * 0.14, 0.83, 0.2]}
            size={[0.06, 0.04, 0.14]}
            color="#111"
            shadow={false}
          />
        ))}
        <Box position={[0, 0.25, 0.35]} size={[0.7, 0.45, 0.35]} color="#3e2723" />
        <Box position={[0, 1.35, -0.1]} size={[0.5, 0.06, 0.1]} color={accent} shadow={false} />
      </group>
    </>
  );
}

function Classroom({ room, layoutDoorHalf }: { room: WaxRoom; layoutDoorHalf: number }) {
  const { bounds } = room;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const theme = WAX_ROOM_THEMES[room.id] ?? WAX_ROOM_THEMES[1];
  const floor = useTexture(() =>
    tileFloorTexture([width / 1.2, depth / 1.2], theme.floor, theme.floorAlt, theme.floorLine),
  );
  const board = useTexture(() => whiteboardTexture(theme.title, theme.lines));
  const plate = useTexture(() => signTexture(room.name, room.subject));
  const { teacherDesk, cornerProp, sideProp, trash } = roomFurniture(room);
  const outerWindows = room.id === 1 ? 'west' : room.id === 3 ? 'east' : null;
  const windowCenters = [bounds.minZ + 2.2, bounds.minZ + 5, bounds.minZ + 7.8];
  return (
    <group>
      <Plane
        position={[centerX, 0.001, (bounds.minZ + bounds.maxZ) / 2]}
        size={[width, depth]}
        map={floor}
      />
      {/* 칠판 쪽 벽 */}
      <Box
        position={[centerX, H / 2, bounds.minZ - T / 2]}
        size={[width + 2 * T, H, T]}
        color={theme.wall}
        block
      />
      {outerWindows === 'west' ? (
        <WindowedWall
          axis="z"
          from={bounds.minZ}
          to={bounds.maxZ}
          at={bounds.minX - T / 2}
          windows={windowCenters}
          color={theme.wall}
          blinds
        />
      ) : (
        <Box
          position={[bounds.minX - T / 2, H / 2, (bounds.minZ + bounds.maxZ) / 2]}
          size={[T, H, depth]}
          color={theme.wall}
          block
        />
      )}
      {outerWindows === 'east' ? (
        <WindowedWall
          axis="z"
          from={bounds.minZ}
          to={bounds.maxZ}
          at={bounds.maxX + T / 2}
          windows={windowCenters}
          color={theme.wall}
          blinds
        />
      ) : (
        <Box
          position={[bounds.maxX + T / 2, H / 2, (bounds.minZ + bounds.maxZ) / 2]}
          size={[T, H, depth]}
          color={theme.wall}
          block
        />
      )}
      {/* 걸레받이 */}
      <Box
        position={[centerX, 0.06, bounds.minZ + 0.01]}
        size={[width, 0.12, 0.02]}
        color={theme.trim}
        shadow={false}
      />
      {/* 복도 쪽 벽의 교실 안쪽 면. 문 구멍은 비운다. */}
      {[
        [bounds.minX, room.doorX - layoutDoorHalf],
        [room.doorX + layoutDoorHalf, bounds.maxX],
      ].map(([from, to]) => (
        <Box
          key={`inner-${from}`}
          position={[(from + to) / 2, H / 2, bounds.maxZ - T / 2 - 0.006]}
          size={[to - from, H, 0.01]}
          color={theme.wall}
          shadow={false}
        />
      ))}
      <Box
        position={[centerX, 0.06, bounds.maxZ - T / 2 - 0.02]}
        size={[width, 0.12, 0.02]}
        color={theme.trim}
        shadow={false}
      />
      <RoomProps kind={theme.prop} corner={cornerProp} side={sideProp} accent={theme.trim} />
      {/* 화이트보드 */}
      <group position={[centerX, 1.65, bounds.minZ + 0.03]}>
        <Box position={[0, 0, 0]} size={[5.6, 1.6, 0.05]} color="#cfd8dc" />
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[5.45, 1.46]} />
          <meshStandardMaterial map={board} roughness={0.35} />
        </mesh>
        <Box position={[0, -0.83, 0.07]} size={[5.4, 0.04, 0.1]} color="#b0bec5" />
        {['#1e4fa8', '#263238', '#d6453d'].map((color, i) => (
          <Box
            key={color}
            position={[-2.2 + i * 0.16, -0.79, 0.09]}
            size={[0.12, 0.025, 0.025]}
            color={color}
            shadow={false}
          />
        ))}
      </group>
      {/* 강의실 표지와 시계 */}
      <group position={[centerX - 1.8, 3.05, bounds.minZ + 0.04]}>
        <mesh>
          <planeGeometry args={[1.8, 0.4]} />
          <meshStandardMaterial map={plate} />
        </mesh>
      </group>
      <group position={[centerX + 2.2, 3.05, bounds.minZ + 0.04]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.05, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Box position={[0, 0.07, 0.04]} size={[0.025, 0.16, 0.01]} color="#222" shadow={false} />
        <Box position={[0.08, 0, 0.04]} size={[0.16, 0.025, 0.01]} color="#222" shadow={false} />
      </group>
      {/* 스피커·벽걸이 에어컨 */}
      {[-3.5, 3.5].map((dx) => (
        <Box
          key={dx}
          position={[centerX + dx, 3.4, bounds.minZ + 0.15]}
          size={[0.28, 0.42, 0.22]}
          color="#37474f"
        />
      ))}
      <group position={[bounds.maxX - 0.18, 3.6, bounds.minZ + 3.2]}>
        <Box position={[0, 0, 0]} size={[0.26, 0.34, 1.1]} color="#fafafa" />
        <Box position={[-0.135, -0.1, 0]} size={[0.01, 0.04, 0.9]} color="#b0bec5" shadow={false} />
      </group>
      {/* 천장 빔프로젝터와 말아 올린 스크린 */}
      <group position={[centerX, H - 0.9, bounds.minZ + 4.6]}>
        <Box position={[0, 0.45, 0]} size={[0.06, 0.9, 0.06]} color="#90a4ae" />
        <Box position={[0, 0, 0]} size={[0.42, 0.14, 0.34]} color="#eceff1" />
        <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
          <meshStandardMaterial color="#263238" />
        </mesh>
      </group>
      <mesh
        position={[centerX, 2.75, bounds.minZ + 0.14]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.07, 0.07, 5.2, 12]} />
        <meshStandardMaterial color="#eceff1" />
      </mesh>
      {/* 교탁: 모니터와 마이크 */}
      <group position={[teacherDesk.x, 0, teacherDesk.z]}>
        <Box
          position={[0, 0.55, 0]}
          size={[teacherDesk.width, 1.1, teacherDesk.depth]}
          color={WAX_SCENE.teacherDesk}
        />
        <Box
          position={[0, 1.12, 0.02]}
          size={[teacherDesk.width + 0.06, 0.04, teacherDesk.depth + 0.06]}
          color="#5d4037"
        />
        <Box position={[0.15, 1.33, -0.12]} size={[0.46, 0.3, 0.03]} color="#263238" />
        <Box position={[0.15, 1.18, -0.12]} size={[0.06, 0.1, 0.06]} color="#263238" />
        <mesh position={[-0.3, 1.25, 0.1]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#212121" />
        </mesh>
      </group>
      {/* 뒤쪽 게시판(공지) */}
      <group
        position={[bounds.minX + 2.6, 1.7, bounds.maxZ - T / 2 - 0.03]}
        rotation={[0, Math.PI, 0]}
      >
        <Box position={[0, 0, 0]} size={[3.2, 1.2, 0.04]} color="#c49a6c" shadow={false} />
        {[-1.1, -0.35, 0.4, 1.1].map((dx, i) => (
          <Box
            key={dx}
            position={[dx, (i % 2) * 0.12, 0.03]}
            size={[0.5, 0.66, 0.01]}
            color={['#fffdf5', '#e3f2fd', '#fff3e0', '#f1f8e9'][i]}
            shadow={false}
          />
        ))}
      </group>
      <TrashBin position={[trash.x, 0, trash.z]} />
      {room.seats.map((seat) => (
        <Desk key={seat.index} seat={seat} color={theme.seat} />
      ))}
      {[-2.6, 0, 2.6].flatMap((dx) =>
        [-7.5, -3.8, -1.2].map((dz) => (
          <CeilingLight key={`${dx}:${dz}`} position={[centerX + dx, H - 0.03, bounds.maxZ + dz]} />
        )),
      )}
    </group>
  );
}

/** 강의실 문(미닫이)과 문 위 호실 표지판. 복도 쪽 벽에 붙는다. */
function Doorway({ room, layout }: { room: WaxRoom; layout: WaxLayout }) {
  const sign = useTexture(() => signTexture(room.name, room.subject));
  const half = layout.doorWidth / 2;
  return (
    <group position={[room.doorX, 0, layout.wallZ]}>
      {/* 문틀은 벽 구멍 안쪽으로 4cm 들어오게 둔다. 벽 끝면과 같은 평면에 겹치면 깜빡이며 깨져 보인다. */}
      <Box
        position={[-half + 0.02, 1.08, 0]}
        size={[0.12, 2.16, T + 0.08]}
        color={WAX_SCENE.doorFrame}
        block
      />
      <Box
        position={[half - 0.02, 1.08, 0]}
        size={[0.12, 2.16, T + 0.08]}
        color={WAX_SCENE.doorFrame}
        block
      />
      <Box
        position={[0, 2.16, 0]}
        size={[layout.doorWidth + 0.08, 0.12, T + 0.08]}
        color={WAX_SCENE.doorFrame}
        block
      />
      {/* 열어둔 미닫이 문짝: 문 옆 벽 안쪽으로 밀려 있다 */}
      <group position={[-half - 0.95, 1.1, -0.16]}>
        <Box position={[0, 0, 0]} size={[1.0, 2.15, 0.05]} color={WAX_SCENE.door} />
        <Box
          position={[0, 0.35, -0.03]}
          size={[0.6, 0.7, 0.01]}
          color={WAX_SCENE.glass}
          opacity={0.5}
          shadow={false}
        />
      </group>
      <mesh
        position={[0, 2.62, T / 2 + 0.02]}
        onUpdate={(mesh) => mesh.layers.enable(WAX_BLOCK_LAYER)}
      >
        <planeGeometry args={[0.9, 0.34]} />
        <meshStandardMaterial map={sign} />
      </mesh>
    </group>
  );
}

const POSTERS = [
  ['중간고사', 'D-7\n도서관 24시 개방', '#3f51b5'],
  ['동아리 박람회', '학생회관 앞\n이번 주 금요일', '#00a37a'],
  ['왁뿌볼 금지', '수업 중 적발 시\n복도로 퇴장!', '#e53935'],
] as const;

function Poster({ index, position }: { index: number; position: Vec3 }) {
  const [title, body, color] = POSTERS[index % POSTERS.length];
  const map = useTexture(() => posterTexture(title, body, color));
  return (
    <mesh position={position} onUpdate={(mesh) => mesh.layers.enable(WAX_BLOCK_LAYER)}>
      <planeGeometry args={[0.5, 0.69]} />
      <meshStandardMaterial map={map} />
    </mesh>
  );
}

type HallFurniture = ReturnType<typeof hallFurniture>[number];

/** 복도 소품 하나. 자리와 크기는 충돌 판정(hallFurniture)과 같다. */
function HallItem({ item }: { item: HallFurniture }) {
  if (item.kind === 'bench')
    return (
      <group position={[item.x, 0, item.z]}>
        <Box
          position={[0, 0.42, 0]}
          size={[item.width, 0.06, item.depth]}
          color={WAX_SCENE.bench}
        />
        <Box
          position={[-item.width / 2 + 0.15, 0.2, 0]}
          size={[0.08, 0.4, item.depth - 0.1]}
          color={WAX_SCENE.metal}
        />
        <Box
          position={[item.width / 2 - 0.15, 0.2, 0]}
          size={[0.08, 0.4, item.depth - 0.1]}
          color={WAX_SCENE.metal}
        />
      </group>
    );
  if (item.kind === 'locker') {
    const count = Math.round(item.width / 0.42);
    const unit = item.width / count;
    const front = item.depth / 2;
    return (
      <group position={[item.x, 0, item.z]}>
        {Array.from({ length: count }, (_, i) => (
          <group key={i} position={[-item.width / 2 + unit * (i + 0.5), 0, 0]}>
            <Box
              position={[0, 0.82, 0]}
              size={[unit - 0.02, 1.64, item.depth]}
              color={WAX_SCENE.lockerBlue[i % WAX_SCENE.lockerBlue.length]}
              block
            />
            {/* 2단 사물함: 칸마다 위쪽 환기구 3줄과 오른쪽 손잡이 */}
            <Box
              position={[0, 0.84, front + 0.004]}
              size={[unit - 0.02, 0.015, 0.008]}
              color={WAX_SCENE.lockerVent}
              shadow={false}
            />
            {[0.06, 0.88].map((bottom) => (
              <group key={bottom}>
                {[0, 1, 2].map((k) => (
                  <Box
                    key={k}
                    position={[-unit * 0.05, bottom + 0.62 - k * 0.05, front + 0.006]}
                    size={[unit * 0.42, 0.018, 0.01]}
                    color={WAX_SCENE.lockerVent}
                    shadow={false}
                  />
                ))}
                <Box
                  position={[unit * 0.3, bottom + 0.36, front + 0.01]}
                  size={[0.03, 0.12, 0.02]}
                  color={WAX_SCENE.lockerHandle}
                  shadow={false}
                />
              </group>
            ))}
          </group>
        ))}
      </group>
    );
  }
  if (item.kind === 'vending') return <VendingMachine item={item} />;
  if (item.kind === 'fountain')
    return (
      <group position={[item.x, 0, item.z]} rotation={[0, Math.PI / 2, 0]}>
        <Box position={[0, 0.45, 0]} size={[item.depth, 0.9, item.width]} color="#b0bec5" />
        <Box
          position={[0, 0.92, 0.02]}
          size={[item.depth - 0.06, 0.06, item.width - 0.04]}
          color="#eceff1"
        />
        <mesh position={[0, 0.98, 0.05]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
          <meshStandardMaterial color="#90a4ae" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    );
  if (item.kind === 'kiosk') return <Kiosk item={item} />;
  if (item.kind === 'trash') return <TrashBin position={[item.x, 0, item.z]} />;
  return (
    <group position={[item.x, 0, item.z]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 12]} />
        <meshStandardMaterial color={WAX_SCENE.plantPot} />
      </mesh>
      {[0, 1, 2, 3].map((leaf) => (
        <mesh
          key={leaf}
          position={[Math.cos(leaf * 1.6) * 0.15, 0.75 + leaf * 0.12, Math.sin(leaf * 1.6) * 0.15]}
          castShadow
        >
          <sphereGeometry args={[0.24, 10, 8]} />
          <meshStandardMaterial color={WAX_SCENE.plant} />
        </mesh>
      ))}
    </group>
  );
}

/** 복도 끝 층별 안내 키오스크. */
function Kiosk({ item }: { item: HallFurniture }) {
  const screen = useTexture(directoryTexture);
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, Math.PI / 2, 0]}>
      <Box position={[0, 0.06, 0]} size={[item.depth, 0.12, item.width]} color="#cfd8dc" />
      <Box position={[0, 0.9, -0.05]} size={[0.7, 1.6, 0.12]} color="#eceff1" />
      <mesh position={[0, 1.0, 0.015]}>
        <planeGeometry args={[0.6, 0.9]} />
        <meshStandardMaterial
          map={screen}
          emissive="#ffffff"
          emissiveMap={screen}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

/** 복도 끝 음료 자판기. */
function VendingMachine({ item }: { item: HallFurniture }) {
  const front = useTexture(() => vendingTexture(item.z < 2.5 ? '#e53935' : '#1e88e5'));
  return (
    <group position={[item.x, 0, item.z]} rotation={[0, -Math.PI / 2, 0]}>
      <Box
        position={[0, 0.95, 0]}
        size={[item.depth - 0.05, 1.9, item.width]}
        color="#eceff1"
        block
      />
      <mesh position={[0, 0.95, item.width / 2 + 0.006]}>
        <planeGeometry args={[item.depth - 0.12, 1.8]} />
        <meshStandardMaterial map={front} roughness={0.4} />
      </mesh>
    </group>
  );
}

function TrashBin({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.14, 0.5, 14]} />
        <meshStandardMaterial color="#546e7a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.51, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 14]} />
        <meshStandardMaterial color="#37474f" />
      </mesh>
    </group>
  );
}

/** 창밖 나무. 로블록스 맵처럼 둥근 잎 덩어리. */
function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 1.8, 8]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {[
        [0, 2.3, 0, 1.1],
        [0.6, 2.0, 0.2, 0.8],
        [-0.55, 2.05, -0.15, 0.85],
        [0.1, 2.9, 0.1, 0.75],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 14, 10]} />
          <meshStandardMaterial color={i % 2 ? '#66bb6a' : '#4caf50'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Hallway({ layout }: { layout: WaxLayout }) {
  const { hall } = layout;
  const width = hall.maxX - hall.minX;
  const depth = hall.maxZ - hall.minZ;
  // 밝고 광택 있는 흰 타일(참고 사진). 반사광이 보이도록 거칠기를 낮춘다.
  const floor = useTexture(() =>
    tileFloorTexture([width / 2.4, depth / 2.4], '#f7f8fa', '#eef0f3', '#c5c9cf'),
  );
  const emblem = useTexture(emblemTexture);
  const sign = useTexture(buildingSignTexture);
  const gaps = layout.rooms
    .map((room) => [room.doorX - layout.doorWidth / 2, room.doorX + layout.doorWidth / 2])
    .sort((a, b) => a[0] - b[0]);
  const edges = [hall.minX - T, ...gaps.flat(), hall.maxX + T];
  const segments: [number, number][] = [];
  for (let i = 0; i < edges.length; i += 2) segments.push([edges[i], edges[i + 1]]);
  const centerX = (hall.minX + hall.maxX) / 2;
  const windows = Array.from({ length: 9 }, (_, i) => hall.minX + 2 + i * ((width - 4) / 8));
  return (
    <group>
      <Plane
        position={[centerX, 0.001, (hall.minZ + hall.maxZ) / 2]}
        size={[width, depth]}
        map={floor}
        roughness={0.35}
      />
      {/* 복도와 강의실 사이 벽(문 구멍 포함) */}
      {segments.map(([from, to]) => (
        <Box
          key={from}
          position={[(from + to) / 2, H / 2, layout.wallZ]}
          size={[to - from, H, T]}
          color={WAX_SCENE.hallWall}
          block
        />
      ))}
      {gaps.map(([from, to]) => (
        <Box
          key={`top-${from}`}
          position={[(from + to) / 2, (2.2 + H) / 2, layout.wallZ]}
          size={[to - from, H - 2.2, T]}
          color={WAX_SCENE.hallWall}
          block
        />
      ))}
      {/* 복도 아래쪽 띠와 검은 걸레받이: 벽과 같은 구간에만 붙여 문 구멍을 가리지 않는다. */}
      {segments.map(([from, to]) => (
        <group key={`band-${from}`}>
          <Box
            position={[(from + to) / 2, 0.5, layout.wallZ + T / 2 + 0.005]}
            size={[to - from, 1.0, 0.01]}
            color={WAX_SCENE.hallWallBand}
            shadow={false}
          />
          <Box
            position={[(from + to) / 2, 0.06, layout.wallZ + T / 2 + 0.012]}
            size={[to - from, 0.12, 0.012]}
            color={WAX_SCENE.hallBaseboard}
            shadow={false}
          />
        </group>
      ))}
      <Box
        position={[centerX, 0.5, hall.maxZ - 0.005]}
        size={[width, 1.0, 0.01]}
        color={WAX_SCENE.hallWallBand}
        shadow={false}
      />
      <Box
        position={[centerX, 0.06, hall.maxZ - 0.012]}
        size={[width, 0.12, 0.012]}
        color={WAX_SCENE.hallBaseboard}
        shadow={false}
      />
      {/* 높은 벽을 나누는 몰딩과 건물 사인 */}
      {segments.map(([from, to]) => (
        <Box
          key={`trim-${from}`}
          position={[(from + to) / 2, 3.2, layout.wallZ + T / 2 + 0.03]}
          size={[to - from, 0.08, 0.06]}
          color={WAX_SCENE.hallWallBand}
          shadow={false}
          block
        />
      ))}
      <mesh
        position={[-1.2, 4.3, layout.wallZ + T / 2 + 0.02]}
        onUpdate={(mesh) => mesh.layers.enable(WAX_BLOCK_LAYER)}
      >
        <planeGeometry args={[6.4, 1.0]} />
        <meshStandardMaterial map={sign} transparent />
      </mesh>
      <WindowedWall
        axis="x"
        from={hall.minX - T}
        to={hall.maxX + T}
        at={hall.maxZ + T / 2}
        windows={windows}
        color={WAX_SCENE.hallWall}
      />
      <Box
        position={[hall.minX - T / 2, H / 2, (hall.minZ + hall.maxZ) / 2]}
        size={[T, H, depth]}
        color={WAX_SCENE.hallWall}
        block
      />
      <Box
        position={[hall.maxX + T / 2, H / 2, (hall.minZ + hall.maxZ) / 2]}
        size={[T, H, depth]}
        color={WAX_SCENE.hallWall}
        block
      />
      {layout.rooms.map((room) => (
        <Doorway key={room.id} room={room} layout={layout} />
      ))}
      {layout.rooms.map((room, i) => {
        const centerX = (room.bounds.minX + room.bounds.maxX) / 2;
        return (
          <group
            key={`board-${room.id}`}
            position={[centerX - 1.6, 1.6, layout.wallZ + T / 2 + 0.02]}
          >
            <Box
              position={[0, 0, 0]}
              size={[2.4, 1.1, 0.04]}
              color="#c49a6c"
              shadow={false}
              block
            />
            <Poster index={i} position={[-0.6, 0, 0.03]} />
            <Poster index={i + 1} position={[0.3, 0.05, 0.03]} />
          </group>
        );
      })}
      {hallFurniture(layout).map((item, i) => (
        <HallItem key={i} item={item} />
      ))}
      <mesh
        position={[0, 0.004, (hall.minZ + hall.maxZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.5, 48]} />
        {/* 브랜드 색이 조명·톤 매핑에 바래지 않도록 톤 매핑을 끄고 반사광을 줄인다. */}
        <meshStandardMaterial map={emblem} roughness={1} toneMapped={false} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <HallLight
          key={i}
          position={[hall.minX + 2 + i * ((width - 4) / 10), H - 0.03, (hall.minZ + hall.maxZ) / 2]}
          length={Math.min(1.8, depth - 0.6)}
        />
      ))}
    </group>
  );
}

/** 복도 1개와 강의실 3개가 붙은 한 층. 좌표는 서버 레이아웃을 그대로 쓴다. */
export function WaxSchool({ layout }: { layout: WaxLayout }) {
  const minX = Math.min(layout.hall.minX, ...layout.rooms.map((room) => room.bounds.minX)) - 1;
  const maxX = Math.max(layout.hall.maxX, ...layout.rooms.map((room) => room.bounds.maxX)) + 1;
  const minZ = Math.min(...layout.rooms.map((room) => room.bounds.minZ)) - 1;
  const maxZ = layout.hall.maxZ + 1;
  const ceiling = useTexture(() => ceilingTexture([(maxX - minX) / 1.2, (maxZ - minZ) / 1.2]));
  return (
    <group>
      {/* 바깥 땅과 천장 */}
      <mesh
        position={[(minX + maxX) / 2, -0.02, (minZ + maxZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[(maxX - minX) * 3, (maxZ - minZ) * 6]} />
        <meshStandardMaterial color="#9ccc65" roughness={1} />
      </mesh>
      <mesh position={[(minX + maxX) / 2, H, (minZ + maxZ) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        {/* 천장은 높게 두고 아래쪽 면만 그린다. 카메라는 건물 안에 머문다. */}
        <planeGeometry args={[maxX - minX, maxZ - minZ]} />
        <meshStandardMaterial map={ceiling} />
      </mesh>
      {/* 건물 바닥 전체를 덮는 기본 바닥: 벽이 반투명해져도 방 사이 틈으로 바깥이 보이지 않는다. */}
      <mesh
        position={[(minX + maxX) / 2, -0.004, (minZ + layout.hall.maxZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[maxX - minX, layout.hall.maxZ - minZ + 0.4]} />
        <meshStandardMaterial color="#d9d5cc" roughness={0.9} />
      </mesh>
      <Hallway layout={layout} />
      {/* 창밖 나무 */}
      {Array.from({ length: 7 }, (_, i) => (
        <Tree
          key={`south-${i}`}
          position={[layout.hall.minX + 1 + i * 5.6, 0, layout.hall.maxZ + 3.2 + (i % 2) * 1.6]}
          scale={0.9 + (i % 3) * 0.15}
        />
      ))}
      {[-1, 1].flatMap((side) =>
        [-8.5, -5, -1.5].map((z) => (
          <Tree
            key={`side-${side}-${z}`}
            position={[side * (Math.max(-minX, maxX) + 2.2), 0, z]}
            scale={0.95}
          />
        )),
      )}
      {layout.rooms.map((room) => (
        <Classroom key={room.id} room={room} layoutDoorHalf={layout.doorWidth / 2} />
      ))}
    </group>
  );
}
