import { apiClient } from '@/lib/apis/client';
import type {
  AttendanceResponse,
  AttendanceSummaryResponse,
  QRCodeResponse,
} from '@/types/attendance';

export const attendanceApi = {
  getAttendance: (clubId: string) =>
    apiClient.get<AttendanceResponse>(`/clubs/${clubId}/attendances`),

  // cardinalNumber 생략 시 본인 최신 소속 기수 기준으로 내려온다
  getDetail: (clubId: string, cardinalNumber?: number) =>
    apiClient.get<AttendanceSummaryResponse>(`/clubs/${clubId}/attendances/detail`, {
      params: cardinalNumber != null ? { cardinalNumber } : undefined,
    }),

  checkIn: (clubId: string, sessionId: number, code: number) =>
    apiClient.post(`/clubs/${clubId}/attendances/sessions/${sessionId}/check-in`, { code }),

  generateQR: (clubId: string, sessionId: number) =>
    apiClient.post<QRCodeResponse>(`/admin/clubs/${clubId}/attendances/${sessionId}/qr`),
};
