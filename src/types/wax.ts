export type WaxPlayerStatus = 'walking' | 'seated' | 'spotted' | 'whacked';

/** 서버 `WaxEmote`. 채팅 대신 주고받는 짧은 의사 표현이다. */
export type WaxEmoteKind = 'wave' | 'laugh' | 'thumbs' | 'shh' | 'help';

export type WaxProfessorMode =
  | 'writing'
  | 'turning'
  | 'watching'
  | 'chasing'
  | 'whacking'
  | 'returning';

export interface WaxRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WaxVariant {
  id: number;
  name: string;
  note: string;
  hardness: number;
  loudness: number;
}

export interface WaxSeat {
  index: number;
  x: number;
  z: number;
  deskX: number;
  deskZ: number;
  variant: number;
}

export interface WaxRoom {
  id: number;
  name: string;
  subject: string;
  professorName: string;
  professorCharacter: string;
  bounds: WaxRect;
  doorX: number;
  professorHome: { x: number; z: number };
  ejectPoint: { x: number; z: number };
  seats: WaxSeat[];
}

export interface WaxLayout {
  hall: WaxRect;
  rooms: WaxRoom[];
  variants: WaxVariant[];
  doorWidth: number;
  wallZ: number;
}

export interface WaxPlayer {
  id: string;
  name: string;
  character: string;
  x: number;
  z: number;
  yaw: number;
  room: number;
  seat: number | null;
  status: WaxPlayerStatus;
  pressing: boolean;
  /** 최근 2.5초 안에 보낸 표현. 없으면 null. */
  emote: WaxEmoteKind | null;
}

export interface WaxProfessor {
  room: number;
  mode: WaxProfessorMode;
  x: number;
  z: number;
  yaw: number;
  targetId: string | null;
}

export interface WaxEjection {
  id: string;
  name: string;
  room: number;
  at: number;
}

export interface WaxState {
  type: 'state';
  now: number;
  players: WaxPlayer[];
  professors: WaxProfessor[];
  you: {
    id: string;
    room: number;
    seat: number | null;
    x: number;
    z: number;
    status: WaxPlayerStatus;
    pressing: boolean;
    noise: number;
    crack: number;
    layer: number;
    smallCracks: number;
    bigCracks: number;
    caughts: number;
  };
  ejections: WaxEjection[];
}

export interface WaxWelcome {
  type: 'welcome';
  worldId: string;
  you: string;
  layout: WaxLayout;
  /** 입력이 없으면 서버가 내보내기까지의 시간(ms). */
  idleTimeoutMs?: number;
}

export type WaxCommand =
  | { type: 'move'; x: number; z: number; yaw: number }
  | { type: 'sit'; room: number; seat: number }
  | { type: 'stand' }
  | { type: 'press'; active: boolean }
  | { type: 'emote'; kind: WaxEmoteKind }
  | { type: 'active' }
  | { type: 'heartbeat' };
