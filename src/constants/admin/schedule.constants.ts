import type { ScheduleType } from '@/types/admin/schedule';

export const SCHEDULE_TYPE_LABEL: Record<ScheduleType, string> = {
  SESSION: '세션',
  EVENT: '일반 일정',
};

export const SCHEDULE_ERROR_MESSAGE: Record<number, string> = {
  20800: '존재하지 않는 일정입니다.',
  20304: '존재하지 않는 세션 그룹입니다.',
  20305: '이미 진행된 세션이 수정 범위에 포함되어 있습니다.',
};

/**
 * 세션 수정 시 scope=THIS_AND_FUTURE 범위에 CLOSED 세션이 포함되어
 * force=true 재요청이 필요할 때 백엔드가 반환하는 에러 코드.
 */
export const SESSION_UPDATE_FORCE_REQUIRED_CODE = 20305;
