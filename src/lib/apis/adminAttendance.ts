import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type {
  AttendanceMember,
  AttendanceStatusUpdate,
  SessionListResponse,
} from '@/types/admin/attendance';

export const adminAttendanceApi = {
  getSessions: (clubId: string, cardinal: number) =>
    apiClient.get<ApiResponse<SessionListResponse>>(
      `/admin/clubs/${clubId}/sessions`,
      { params: { cardinal } },
    ),

  getAttendanceBySession: (clubId: string, sessionId: number) =>
    apiClient.get<ApiResponse<AttendanceMember[]>>(
      `/admin/clubs/${clubId}/attendances/${sessionId}`,
    ),

  updateAttendanceStatus: (clubId: string, body: AttendanceStatusUpdate[]) =>
    apiClient.patch(`/admin/clubs/${clubId}/attendances/status`, body),
};
