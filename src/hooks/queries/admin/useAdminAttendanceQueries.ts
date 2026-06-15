import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminAttendanceApi } from '@/lib/apis/adminAttendance';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance/error';
import { useClubId } from '@/stores';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import type { ApiResponse } from '@/types/common';

export function useAdminSessions(cardinal: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['admin', 'sessions', clubId, cardinal],
    queryFn: async () => {
      const res = await adminAttendanceApi.getSessions(clubId!, cardinal ?? undefined);
      return res.data.data;
    },
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAdminAttendance(sessionId: number | null, options?: { enabled?: boolean }) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['admin', 'attendance', clubId, sessionId],
    queryFn: async () => {
      const res = await adminAttendanceApi.getAttendanceBySession(clubId!, sessionId!);
      return res.data.data;
    },
    enabled: !!clubId && sessionId !== null && (options?.enabled ?? true),
  });
}

export function useUpdateAttendanceStatus(sessionId: number) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) =>
      adminAttendanceApi.updateAttendanceStatus(
        clubId!,
        updates.map((u) => ({ attendanceId: u.id, status: u.status })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', clubId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ['attendance', clubId] });
      toastSuccess('출석 상태가 저장되었습니다.');
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const code = error.response?.data?.code;
      const message = code ? ATTENDANCE_ERROR_MESSAGE[code] : '출석 상태 저장에 실패했습니다.';
      toastError(message);
    },
  });
}
