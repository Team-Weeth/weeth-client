import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { Schedule } from '@/types/admin/schedule';

export const adminScheduleApi = {
  getMonthly: (clubId: string, start: string, end: string) =>
    apiClient.get<ApiResponse<Schedule[]>>(`/clubs/${clubId}/schedules/monthly`, {
      params: { start, end },
    }),
};
