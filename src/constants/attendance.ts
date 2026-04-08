import type { AttendanceStatus } from '@/types/attendance';

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  ATTEND: { label: '출석', className: 'bg-container-primary text-text-inverse' },
  ABSENT: { label: '결석', className: 'bg-state-error text-text-inverse' },
  PENDING: { label: '미정', className: 'bg-container-neutral-interaction text-text-alternative' },
};
