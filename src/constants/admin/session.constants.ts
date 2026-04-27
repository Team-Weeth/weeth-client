import type { SessionRecurrenceType, SessionStatus } from '@/types/admin/session';

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  OPEN: '진행 중',
  COMPLETED: '종료',
  SCHEDULED: '예정',
  CANCELED: '취소',
};

export const SESSION_RECURRENCE_LABEL: Record<SessionRecurrenceType, string> = {
  NONE: '안 함',
  DAILY: '매일',
  WEEKLY: '매주',
  MONTHLY: '매월',
};

export const SESSION_RECURRENCE_OPTIONS: SessionRecurrenceType[] = [
  'NONE',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
];
