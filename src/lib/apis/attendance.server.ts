import { apiServer } from '@/lib/apis/server';
import type { AttendanceResponse, AttendanceSummaryResponse } from '@/types/attendance';

export const attendanceServerApi = {
  getAttendance: (clubId: string) =>
    apiServer.get<AttendanceResponse>(`/clubs/${clubId}/attendances`, {
      cache: 'no-store',
    }),

  // cardinalNumber 생략 시 본인 최신 소속 기수 기준으로 내려온다
  getDetail: (clubId: string, cardinalNumber?: number) =>
    apiServer.get<AttendanceSummaryResponse>(`/clubs/${clubId}/attendances/detail`, {
      cache: 'no-store',
      ...(cardinalNumber != null && { params: { cardinalNumber } }),
    }),
};
