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
  | { type: 'join'; worldId?: string; name?: string; token?: string }
  | { type: 'move'; x: number; z: number; yaw: number }
  | { type: 'sit'; room: number; seat: number }
  | { type: 'stand' }
  | { type: 'press'; active: boolean }
  | { type: 'emote'; kind: WaxEmoteKind }
  | { type: 'active' }
  | { type: 'heartbeat' };

/** 연결이 받아들여지면 서버가 먼저 보내는 추천 닉네임. 닉네임 결정 모달에 띄운다. */
export interface WaxHello {
  type: 'hello';
  suggestion: string;
}

export type WaxRankingPeriod = 'DAILY' | 'WEEKLY';

export interface WaxRankingEntry {
  rank: number;
  name: string;
  /** 한 판에 깬 왁스 수의 기간 내 최고 기록 */
  brokenWaxes: number;
}

/** 서버 `GET /minigame/wax/rankings` 응답. 기간은 한국 시간 기준(일간 자정, 주간 월요일 자정에 초기화). */
export interface WaxRanking {
  period: WaxRankingPeriod;
  startDate: string;
  resetAt: string;
  rankings: WaxRankingEntry[];
  me: WaxRankingEntry | null;
}
