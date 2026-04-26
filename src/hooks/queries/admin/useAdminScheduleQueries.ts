import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { SCHEDULE_ERROR_MESSAGE } from '@/constants/admin/schedule.constants';
import { adminScheduleApi } from '@/lib/apis/adminSchedule';
import { useClubId } from '@/stores';
import { toastError } from '@/stores/useToastStore';
import type { CreateEventBody, UpdateEventBody } from '@/types/admin/schedule';
import type { CreateSessionBody } from '@/types/admin/session';
import { MutationCallbacks } from '@/types';

function toMonthRange(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${pad(month)}-01T00:00:00`,
    end: `${year}-${pad(month)}-${pad(lastDay)}T23:59:59`,
  };
}

export function useAdminMonthlySchedules(year: number, month: number) {
  const clubId = useClubId();
  const { start, end } = toMonthRange(year, month);

  return useQuery({
    queryKey: ['admin', 'schedules', clubId, year, month],
    queryFn: async () => {
      const res = await adminScheduleApi.getMonthly(clubId!, start, end);
      return res.data.data;
    },
    enabled: !!clubId,
  });
}

export function useAdminSessionList(cardinal?: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['admin', 'sessionList', clubId, cardinal ?? null],
    queryFn: async () => {
      const res = await adminScheduleApi.getSessionList(clubId!, cardinal ?? undefined);
      return res.data.data;
    },
    enabled: !!clubId,
  });
}

export function useAdminScheduleDetail(eventId: number) {
  const clubId = useClubId();

  return useSuspenseQuery({
    queryKey: ['admin', 'schedule', clubId, eventId],
    queryFn: () => adminScheduleApi.getEventDetail(clubId!, eventId).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSchedule() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateEventBody) => adminScheduleApi.createEvent(clubId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
    },
    onError: (error) => {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      toastError(code ? (SCHEDULE_ERROR_MESSAGE[code] ?? undefined) : undefined);
    },
  });
}

export function useCreateSession(callback?: MutationCallbacks) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSessionBody) => adminScheduleApi.createSession(clubId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessionList'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      callback?.onSuccess?.();
    },
    onError: (error) => {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      toastError(code ? (SCHEDULE_ERROR_MESSAGE[code] ?? undefined) : undefined);
      callback?.onError?.(error);
    },
  });
}

export function useUpdateSchedule() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: number; body: UpdateEventBody }) =>
      adminScheduleApi.updateEvent(clubId!, eventId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
    },
    onError: (error) => {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      toastError(code ? (SCHEDULE_ERROR_MESSAGE[code] ?? undefined) : undefined);
    },
  });
}

export function useDeleteSchedule(callback?: MutationCallbacks) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => adminScheduleApi.deleteEvent(clubId!, eventId),
    onSuccess: () => {
      if (callback?.onSuccess) {
        callback.onSuccess();
        queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      }
    },
    onError: (error) => {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      toastError(code ? (SCHEDULE_ERROR_MESSAGE[code] ?? undefined) : undefined);
    },
  });
}
