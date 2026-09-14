import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { ScheduleDetail, ScheduleItem, ScheduleType } from '@/types/api/schedule';

export const scheduleApi = {
  /** 일정 상세 조회 */
  getDetail: (clubId: string, id: number, type: ScheduleType) =>
    apiClient.get<ApiResponse<ScheduleDetail>>(`/clubs/${clubId}/schedules/${id}`, {
      params: { type },
    }),

  /** 월별 일정 조회 */
  getMonthly: (clubId: string, cardinal: number, start: string, end: string) =>
    apiClient.get<ApiResponse<ScheduleItem[]>>(`/clubs/${clubId}/schedules/monthly`, {
      params: { cardinal, start, end },
    }),
};
