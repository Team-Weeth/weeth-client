import { ATTENDANCE_STATUS_BASE } from './attendance.base';

export const USER_ATTENDANCE_STATUS_CONFIG = {
  ATTEND: {
    ...ATTENDANCE_STATUS_BASE.ATTEND,
    className: 'bg-container-primary text-text-inverse',
  },
  ABSENT: {
    ...ATTENDANCE_STATUS_BASE.ABSENT,
    className: 'bg-state-error text-text-inverse',
  },
  PENDING: {
    ...ATTENDANCE_STATUS_BASE.PENDING,
    className: 'bg-container-neutral-interaction text-text-alternative',
  },
} as const;
