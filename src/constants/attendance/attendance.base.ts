import type { AttendanceStatus } from '@/types/attendance';

export const ATTENDANCE_STATUS_BASE: Record<AttendanceStatus, { label: string }> = {
  ATTEND: { label: '출석' },
  ABSENT: { label: '결석' },
  PENDING: { label: '미결' },
};
