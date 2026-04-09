import { apiClient } from '@/lib/apis/client';
import type { AttendanceResponse } from '@/types/attendance';

export const attendanceApi = {
  getAttendance: (clubId: string) =>
    apiClient.get<AttendanceResponse>(`/clubs/${clubId}/attendances`),
};
