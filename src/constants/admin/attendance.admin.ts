import { ATTENDANCE_STATUS_BASE } from '@/constants/attendance';
import AdminRoundCancelIcon from '@/assets/icons/admin/ic_admin_round_cancel.svg';
import AdminTimeIcon from '@/assets/icons/admin/ic_admin_time.svg';
import CheckRoundIcon from '@/assets/icons/check_round.svg';

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
