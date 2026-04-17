'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminAttendanceApi } from '@/lib/apis/adminAttendance';
import { useClubId } from '@/stores';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import { useAdminAttendance } from '@/hooks/queries/admin';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance/error';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/common';

import { AttendanceCard } from './AttendanceCard';

interface AttendanceSessionCardProps {
  sessionId: number;
  date: string;
  title: string;
  isCurrentWeek?: boolean;
  onDirtyChange?: (sessionId: number, dirty: boolean) => void;
}

function AttendanceSessionCard({
  sessionId,
  date,
  title,
  isCurrentWeek,
  onDirtyChange,
}: AttendanceSessionCardProps) {
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const { data: members = [] } = useAdminAttendance(sessionId);

  const { mutateAsync } = useMutation({
    mutationFn: (updates: { id: number; status: 'ATTEND' | 'ABSENT' }[]) =>
      adminAttendanceApi.updateAttendanceStatus(
        clubId!,
        updates.map((u) => ({ attendanceId: u.id, status: u.status })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', clubId, sessionId] });
      toastSuccess('출석 상태가 저장되었습니다.');
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const code = error.response?.data?.code;
      const message = code ? ATTENDANCE_ERROR_MESSAGE[code] : undefined;
      toastError(message);
    },
  });

  const handleDirtyChange = useCallback(
    (dirty: boolean) => onDirtyChange?.(sessionId, dirty),
    [onDirtyChange, sessionId],
  );

  return (
    <AttendanceCard
      date={date}
      title={title}
      isCurrentWeek={isCurrentWeek}
      members={members}
      onSave={mutateAsync}
      onDirtyChange={handleDirtyChange}
    />
  );
}

export { AttendanceSessionCard, type AttendanceSessionCardProps };
