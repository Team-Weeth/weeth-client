import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type {
  CreateEventBody,
  Schedule,
  ScheduleDetail,
  UpdateEventBody,
} from '@/types/admin/schedule';
import type { AdminSessionListData } from '@/types/admin/session';

export const adminScheduleApi = {
  getMonthly: (clubId: string, start: string, end: string) =>
    apiClient.get<ApiResponse<Schedule[]>>(`/clubs/${clubId}/schedules/monthly`, {
      params: { start, end },
    }),
  getEventDetail: (clubId: string, eventId: number) =>
    apiClient.get<ApiResponse<ScheduleDetail>>(`/clubs/${clubId}/events/${eventId}`),
  getSessionList: (clubId: string, cardinal?: number) =>
    apiClient.get<ApiResponse<AdminSessionListData>>(`/admin/clubs/${clubId}/sessions`, {
      params: cardinal !== undefined ? { cardinal } : undefined,
    }),
  createEvent: (clubId: string, body: CreateEventBody) =>
    apiClient.post<ApiResponse<string>>(`/admin/clubs/${clubId}/events`, body),
  updateEvent: (clubId: string, eventId: number, body: UpdateEventBody) =>
    apiClient.patch<ApiResponse<null>>(`/admin/clubs/${clubId}/events/${eventId}`, body),
  deleteEvent: (clubId: string, eventId: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/clubs/${clubId}/events/${eventId}`),
};
