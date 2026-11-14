import type { WaxEmoteKind } from '@/types/wax';

/**
 * 3D 공간 재질 색상. UI 토큰이 아니라 교실 소품의 물리적 색이므로 장면 전용 상수로 둔다.
 * 레퍼런스: 노션 첨부의 로블록스 교실(하늘색 벽·나무 책상·초록 칠판).
 */
export const WAX_SCENE = {
  sky: '#bfe4ff',
  hallFloor: '#cfd6de',
  hallFloorLine: '#c3c8d0',
  roomFloor: '#d8b48a',
  roomFloorLine: '#c39a6e',
  wall: '#f3efe7',
  // 복도: 참고 사진의 크림색 벽, 검은 걸레받이, 하늘색 2단 사물함.
  // 조명·톤 매핑에서 밝은 색의 채도가 빠져, 화면에서 참고 사진(채도 약 0.27)만큼 보이도록 더 진하게 잡았다.
  hallWall: '#f0d47b',
  hallWallBand: '#e5c766',
  hallBaseboard: '#2f3237',
  lockerBlue: ['#5a9fd4', '#64a8db'],
  lockerVent: '#3b7cb2',
  lockerHandle: '#dfe3e8',
  wallAccent: '#c9a27c',
  baseboard: '#5b7c99',
  ceiling: '#f7f9fb',
  light: '#ffffff',
  board: '#2f5d46',
  boardFrame: '#8a5a32',
  chalk: '#f4f1e8',
  deskTop: '#e2b77d',
  deskEdge: '#b9854e',
  metal: '#4b5866',
  chair: '#3d6f9e',
  teacherDesk: '#9b6a3f',
  doorFrame: '#6b4a2f',
  door: '#b07b4b',
  windowFrame: '#ffffff',
  glass: '#a8dcff',
  lockers: ['#ff8a80', '#ffd166', '#06d6a0', '#4fc3f7', '#b39ddb'],
  plantPot: '#c96f4a',
  plant: '#4caf50',
  bench: '#8d6e63',
  rod: '#7a4a24',
  skin: '#f3bf98',
} as const;

/**
 * 플레이어끼리 주고받는 표현. 순서가 감정 표현 패널 순서이자 키보드 1~4 단축키다.
 * sprite는 /images/wax/reactions.png(가로 4칸)에서 쓸 칸이다. 서버는 thumbs도 받지만 화면에서는 고르지 않는다.
 */
export const WAX_EMOTES: { kind: WaxEmoteKind; label: string; sprite: number }[] = [
  { kind: 'wave', label: '안녕', sprite: 0 },
  { kind: 'shh', label: '쉿', sprite: 1 },
  { kind: 'help', label: '살려줘', sprite: 2 },
  { kind: 'laugh', label: 'ㅋㅋㅋ', sprite: 3 },
];

export type WaxFinish = 'gloss' | 'matte' | 'pearl' | 'marble' | 'glitter';

/**
 * 서버 `WaxLayout.VARIANTS`와 같은 순서. 왁뿌볼은 말랑한 속(core)을 얇은 왁스로 여러 겹 감싼 공이다.
 * layers는 바깥층부터 안쪽 순서이고, 큰 깨짐마다 한 겹씩 벗겨진다. 소리는 public/audio/wax/banks.json에서 고른다.
 */
export const WAX_BALL_LOOKS: { layers: string[]; core: string; finish: WaxFinish }[] = [
  { layers: ['#ffc4d6', '#fff0b3', '#c7f0ff'], core: '#ff8fb3', finish: 'gloss' },
  { layers: ['#5f9a6e', '#a8d5b5', '#e9f5ec'], core: '#3d7a55', finish: 'matte' },
  { layers: ['#ffe066', '#ffffff', '#ffd1dc'], core: '#ffb703', finish: 'gloss' },
  { layers: ['#c9b8ff', '#e8e0ff', '#b8f2e6'], core: '#8f7cf0', finish: 'matte' },
  {
    layers: ['#8a5a3c', '#c99a6b', '#f1d7b8', '#a26f4d', '#e8c39e'],
    core: '#5c3a26',
    finish: 'matte',
  },
  { layers: ['#ff8080', '#ffffff', '#ff5c5c'], core: '#e63946', finish: 'marble' },
  { layers: ['#fbfaf6', '#efe9ff', '#fff6e0'], core: '#f2d8a7', finish: 'matte' },
  { layers: ['#ffb3cf', '#fde2f3', '#ffd6e8'], core: '#ff6f9f', finish: 'pearl' },
  { layers: ['#9b6bff', '#d6c2ff', '#7a4dff'], core: '#5b2bd1', finish: 'glitter' },
];

/** 서버 `WaxLayout.STUDENT_CHARACTERS`와 강의실별 교수님 캐릭터(Kenney Mini Characters 모델 이름). */
export const WAX_CHARACTERS = [
  'female-b',
  'female-c',
  'female-e',
  'female-f',
  'male-f',
  'male-e',
  'male-b',
  'male-d',
] as const;
export const waxCharacterUrl = (character: string) => `/models/wax/mini/character-${character}.glb`;
export const WAX_STUDENT_HEIGHT = 1.3;
export const WAX_PROFESSOR_HEIGHT = 1.5;

export type WaxRoomProp = 'lab' | 'art' | 'music';

/** 강의실마다 다른 분위기. 키는 서버 레이아웃의 room.id다. 과목·교수님 캐릭터는 서버가 정한다. */
export const WAX_ROOM_THEMES: Record<
  number,
  {
    wall: string;
    trim: string;
    seat: string;
    floor: string;
    floorAlt: string;
    floorLine: string;
    prop: WaxRoomProp;
    title: string;
    lines: string[];
  }
> = {
  1: {
    wall: '#eef4f1',
    trim: '#4f9d84',
    seat: '#5aa58c',
    floor: '#e3e6e2',
    floorAlt: '#d9ddd8',
    floorLine: '#c9cec8',
    prop: 'lab',
    title: '일반화학 · Ch.3 상변화',
    lines: [
      '파라핀 왁스의 녹는점 ≈ 50~60℃',
      '층이 얇을수록 균열이 빨리 퍼진다',
      '※ 수업 중 왁뿌볼 금지',
    ],
  },
  2: {
    wall: '#f7f1e8',
    trim: '#d9844f',
    seat: '#e3935f',
    floor: '#ebe2d4',
    floorAlt: '#e2d7c6',
    floorLine: '#d3c6b1',
    prop: 'art',
    title: '기초 드로잉 · Week 5',
    lines: ['레이어: 바깥층 → 안쪽층', '과제: 크로키 10장 (금요일까지)', '※ 들키면 회초리 한 대'],
  },
  3: {
    wall: '#f0edf7',
    trim: '#7a68c2',
    seat: '#8676cc',
    floor: '#e3dfea',
    floorAlt: '#d9d4e2',
    floorLine: '#c9c3d6',
    prop: 'music',
    title: '음악의 이해 · 리듬 기초',
    lines: ['쉼표의 길이를 지켜라', '교수님이 돌아보면 → 쉼표', '출석은 수업 끝나고 부릅니다'],
  },
};
