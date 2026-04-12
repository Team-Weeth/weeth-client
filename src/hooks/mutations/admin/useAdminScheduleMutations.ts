import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminScheduleApi } from '@/lib/apis/adminSchedule';
import type { CreateScheduleBody } from '@/types/admin/schedule';
import { useClubId } from '@/stores';
import { toastError, toastSuccess } from '@/stores/useToastStore';

export function useCreateSchedule() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateScheduleBody) => adminScheduleApi.createSchedule(clubId!, body),
    onSuccess: () => {
      toastSuccess('일정이 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules', clubId] });
    },
    onError: () => {
      toastError('일정 생성에 실패했습니다.');
    },
  });
}

export function useDeleteSchedule() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: number) => adminScheduleApi.deleteSchedule(clubId!, scheduleId),
    onSuccess: () => {
      toastSuccess('일정이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules', clubId] });
    },
    onError: () => {
      toastError('일정 삭제에 실패했습니다.');
    },
  });
}
