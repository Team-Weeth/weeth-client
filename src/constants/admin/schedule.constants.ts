import type { ScheduleType } from '@/types/admin/schedule';

export const SCHEDULE_TYPE_LABEL: Record<ScheduleType, string> = {
  SESSION: '세션',
  EVENT: '일반 일정',
};

export const SCHEDULE_ERROR_MESSAGE: Record<number, string> = {
  20800: '존재하지 않는 일정입니다.',
};
