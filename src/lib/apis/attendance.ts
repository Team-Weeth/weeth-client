import { apiClient } from '@/lib/apis/client';
import type { AttendanceResponse, QRCodeResponse } from '@/types/attendance';

export const attendanceApi = {
  getAttendance: (clubId: string) =>
    apiClient.get<AttendanceResponse>(`/clubs/${clubId}/attendances`),

  checkIn: (clubId: string, sessionId: number, code: number) =>
    apiClient.post(`/clubs/${clubId}/attendances/check-in`, { sessionId, code }),

  generateQR: (clubId: string, sessionId: number) =>
    apiClient.post<QRCodeResponse>(`/admin/clubs/${clubId}/attendances/${sessionId}/qr`),
};
