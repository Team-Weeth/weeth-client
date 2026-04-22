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
  groupId: number;
  title: string;
  recurrenceType: SessionRecurrenceType;
  /** "매주 목요일 오후 7:00 ~ 오후 9:00" 처럼 서버에서 렌더링된 문구 */
  recurrenceDescription: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
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
  recurrenceType: SessionRecurrenceType;
  /** YYYY-MM-DD. recurrenceType이 NONE이면 end 날짜와 동일하게 전송 */
  recurrenceEndDate: string;
}
