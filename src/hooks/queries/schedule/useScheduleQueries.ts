import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { scheduleApi } from '@/lib/apis/schedule';
import { useClubId } from '@/stores';
import type { ScheduleType } from '@/types/api/schedule';
import { scheduleQueryKeys } from './scheduleQueryKeys';

function toMonthRange(year: number, month: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${pad(month)}-01T00:00:00`,
    end: `${year}-${pad(month)}-${pad(lastDay)}T23:59:59`,
  };
}

export function useMonthlySchedulesQuery(year: number, month: number, cardinal: number | undefined) {
  const clubId = useClubId();
  const { start, end } = toMonthRange(year, month);

  return useQuery({
    queryKey: scheduleQueryKeys.monthly(clubId, year, month, cardinal ?? 0),
    queryFn: () =>
      scheduleApi.getMonthly(clubId!, cardinal!, start, end).then((res) => res.data.data),
    enabled: !!clubId && cardinal !== undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useScheduleDetailQuery(id: number, type: ScheduleType) {
  const clubId = useClubId();

  return useSuspenseQuery({
    queryKey: scheduleQueryKeys.detail(clubId, id, type),
    queryFn: () => scheduleApi.getDetail(clubId!, id, type).then((res) => res.data.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
