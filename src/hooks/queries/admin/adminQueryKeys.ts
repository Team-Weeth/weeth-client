import type { TransactionsParams } from '@/types/admin/dues';

export const adminQueryKeys = {
  all: ['admin'] as const,

  club: (clubId: string | null) => ['admin', 'club', clubId] as const,

  members: (clubId: string | null) => ['admin', 'members', clubId] as const,

  boards: (clubId: string | null) => ['admin', 'boards', clubId] as const,

  // 페널티 — 기수별 멤버 목록, 멤버 단건 상세
  penalties: (clubId: string | null) => ['admin', 'penalties', clubId] as const,
  penaltyMembers: (clubId: string | null, cardinalNumber: number | null) =>
    ['admin', 'penalties', clubId, 'members', cardinalNumber] as const,
  memberPenaltyDetail: (clubId: string | null, clubMemberId: number | null) =>
    ['admin', 'penalties', clubId, 'detail', clubMemberId] as const,

  // 월간 일정 — 세션/이벤트 뮤테이션이 schedules prefix로 prefix invalidate
  schedules: (clubId: string | null) => ['admin', 'schedules', clubId] as const,
  monthlySchedule: (clubId: string | null, year: number, month: number) =>
    ['admin', 'schedules', clubId, year, month] as const,
  scheduleDetail: (clubId: string | null, eventId: number | null) =>
    ['admin', 'schedule', clubId, eventId] as const,

  // 세션 — 출석/일정 모두 같은 엔드포인트를 공유하므로 단일 prefix
  sessions: (clubId: string | null) => ['admin', 'sessions', clubId] as const,
  sessionsByCardinal: (clubId: string | null, cardinal: number | null) =>
    ['admin', 'sessions', clubId, cardinal] as const,
  sessionDetail: (clubId: string | null, sessionId: number | null) =>
    ['admin', 'sessionDetail', clubId, sessionId] as const,

  // 출석 상세
  attendance: (clubId: string | null, sessionId: number | null) =>
    ['admin', 'attendance', clubId, sessionId] as const,

  // 회비 거래내역 — 필터/정렬/페이지 파라미터별로 캐시 분리
  duesTransactions: (
    clubId: string | null,
    accountId: number | null,
    params?: TransactionsParams,
  ) => ['admin', 'dues', 'transactions', clubId, accountId, params] as const,

  // 회비 거래내역 상세 — accountId + transactionId 단위로 스코프
  duesTransaction: (
    clubId: string | null,
    accountId: number | null,
    transactionId: number | null,
  ) => ['admin', 'dues', 'transaction', clubId, accountId, transactionId] as const,

  // 회비 대시보드 — 기수 번호(cardinalNumber) 단위로 스코프
  duesDashboard: (clubId: string, cardinalNumber: number | null) =>
    ['admin', 'dues', 'dashboard', clubId, cardinalNumber] as const,

  // 회비 등록(온보딩) — accountId 단위로 스코프
  duesRegistrationStatus: (clubId: string, accountId: number | null) =>
    ['admin', 'dues', 'registrationStatus', clubId, accountId] as const,
  duesPaymentTargets: (clubId: string, accountId: number | null) =>
    ['admin', 'dues', 'paymentTargets', clubId, accountId] as const,
  duesCarryOverSource: (clubId: string, accountId: number | null) =>
    ['admin', 'dues', 'carryOverSource', clubId, accountId] as const,
} as const;
