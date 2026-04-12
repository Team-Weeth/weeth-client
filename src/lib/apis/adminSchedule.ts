import { apiClient } from '@/lib/apis/client';
import type { Schedule, CreateScheduleBody } from '@/types/admin/schedule';
import type { ApiResponse } from '@/types/common';

export const adminScheduleApi = {
  getSchedules: (clubId: string, cardinalId: number) =>
    apiClient.get<ApiResponse<Schedule[]>>(
      `/admin/clubs/${clubId}/cardinals/${cardinalId}/schedules`,
    ),
  createSchedule: (clubId: string, body: CreateScheduleBody) =>
    apiClient.post(`/admin/clubs/${clubId}/schedules`, body),
  deleteSchedule: (clubId: string, scheduleId: number) =>
    apiClient.delete(`/admin/clubs/${clubId}/schedules/${scheduleId}`),
};
