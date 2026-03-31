import { apiClient } from '@/lib/apis/client';
import { API_BASE_PATH } from '@/constants/api';
import type { AttendanceResponse } from '@/types/attendance';

export const attendanceApi = {
  getAttendance: (clubId: string) =>
    apiClient.get<AttendanceResponse>(`${API_BASE_PATH}/clubs/${clubId}/attendances`),
};
