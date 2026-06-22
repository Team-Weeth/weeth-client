import type { AttendanceStatus } from '@/types/attendance';

export const ATTENDANCE_STATUS_BASE: Record<AttendanceStatus, { label: string }> = {
  ATTEND: { label: '출석' },
  ABSENT: { label: '결석' },
  PENDING: { label: '미결' },
};

export const ATTENDANCE_STALE_TIME = Infinity;
export const ATTENDANCE_GC_TIME = 30 * 60 * 1000;
export const ATTENDANCE_QR_GC_TIME = 30 * 60 * 1000;
