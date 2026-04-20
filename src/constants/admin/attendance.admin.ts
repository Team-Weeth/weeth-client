import { ATTENDANCE_STATUS_BASE } from '@/constants/attendance';
import { AdminRoundCancelIcon, AdminTimeIcon } from '@/assets/icons/admin';
import { CheckRoundIcon } from '@/assets/icons';

export const ADMIN_ATTENDANCE_STATUS_CONFIG = {
  PENDING: {
    ...ATTENDANCE_STATUS_BASE.PENDING,
    src: AdminTimeIcon,
    className: 'text-text-alternative',
  },
  ATTEND: {
    ...ATTENDANCE_STATUS_BASE.ATTEND,
    src: CheckRoundIcon,
    className: 'text-state-success',
  },
  ABSENT: {
    ...ATTENDANCE_STATUS_BASE.ABSENT,
    src: AdminRoundCancelIcon,
    className: 'text-state-error',
  },
} as const;
