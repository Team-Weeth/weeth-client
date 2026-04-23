import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { CreateEventBody, UpdateEventBody, Schedule } from '@/types/admin/schedule';

export const adminScheduleApi = {
  getMonthly: (clubId: string, start: string, end: string) =>
    apiClient.get<ApiResponse<Schedule[]>>(`/clubs/${clubId}/schedules/monthly`, {
      params: { start, end },
    }),
  createEvent: (clubId: string, body: CreateEventBody) =>
    apiClient.post<ApiResponse<string>>(`/admin/clubs/${clubId}/events`, body),
  updateEvent: (clubId: string, eventId: number, body: UpdateEventBody) =>
    apiClient.patch<ApiResponse<null>>(`/admin/clubs/${clubId}/events/${eventId}`, body),
  deleteEvent: (clubId: string, eventId: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/clubs/${clubId}/events/${eventId}`),
};
