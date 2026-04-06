import { apiClient } from '@/lib/apis/client';
import { apiServer } from '@/lib/apis/server';
import type { AttendanceResponse } from '@/types/attendance';

export const attendanceApi = {
  getAttendance: (clubId: string) =>
    apiClient.get<AttendanceResponse>(`/clubs/${clubId}/attendances`),

  checkIn: (clubId: string, sessionId: number, code: number) =>
    apiClient.post(`/clubs/${clubId}/attendances/check-in`, { sessionId, code }),
};

export const attendanceServerApi = {
  getAttendance: (clubId: string) =>
    apiServer.get<AttendanceResponse>(`/clubs/${clubId}/attendances`, {
      cache: 'no-store',
    }),
};
