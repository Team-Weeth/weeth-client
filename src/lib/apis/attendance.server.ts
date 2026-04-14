import { apiServer } from '@/lib/apis/server';
import type { AttendanceResponse, AttendanceSummaryResponse } from '@/types/attendance';

export const attendanceServerApi = {
  getAttendance: (clubId: string) =>
    apiServer.get<AttendanceResponse>(`/clubs/${clubId}/attendances`, {
      cache: 'no-store',
    }),

  getDetail: (clubId: string) =>
    apiServer.get<AttendanceSummaryResponse>(`/clubs/${clubId}/attendances/detail`, {
      cache: 'no-store',
    }),
};
