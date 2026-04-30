export type SessionStatus = 'OPEN' | 'COMPLETED' | 'SCHEDULED' | 'CANCELED';

export type SessionRecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE';

export interface AdminSession {
  id: number;
  cardinal: number;
  title: string;
  /** ISO 8601 시작 일시 */
  start: string;
  /** ISO 8601 종료 일시 */
  end: string;
  status: SessionStatus;
}

export interface AdminSessionGroup {
  /** 단발(반복 없음) 세션은 그룹이 아니므로 null */
  groupId: number | null;
  title: string;
  /** 단발 세션은 null */
  recurrenceType: SessionRecurrenceType | null;
  /** "매주 목요일 오후 7:00 ~ 오후 9:00" 처럼 서버에서 렌더링된 문구. 단발 세션은 null */
  recurrenceDescription: string | null;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD. 단발 세션은 반복 종료일이 없으므로 null */
  endDate: string | null;
  completedCount: number;
  totalCount: number;
  status: SessionStatus;
  /** 하위 세션 목록 (없거나 단일이면 토글이 숨겨짐) */
  sessions: AdminSession[];
}

export interface AdminSessionListData {
  thisWeek: AdminSession[];
  sessions: AdminSessionGroup[];
}

export interface CreateSessionBody {
  title: string;
  content: string;
  location: string;
  cardinal: number;
  /** ISO 8601 (로컬 타임, 초 포함) — "2026-03-26T10:00:00" */
  start: string;
  end: string;
  /** 반복 설정을 선택하지 않으면 null */
  recurrenceType: SessionRecurrenceType | null;
  /** YYYY-MM-DD. 반복 설정을 선택하지 않으면 null */
  recurrenceEndDate: string | null;
}

export interface UpdateSessionBody {
  title: string;
  content: string;
  location: string;
  /** ISO 8601 (로컬 타임, 초 포함) — "2026-03-27T10:00:00" */
  start: string;
  end: string;
}

/** 정기모임 수정 적용 범위 */
export type SessionUpdateScope = 'THIS_ONLY' | 'THIS_AND_FUTURE';
