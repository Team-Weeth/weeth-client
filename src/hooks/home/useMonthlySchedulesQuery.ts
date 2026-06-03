import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

const MONTHLY_SCHEDULES_STALE_TIME = 10 * 60 * 1000;
const MONTHLY_SCHEDULES_GC_TIME = 30 * 60 * 1000;

export function useMonthlySchedulesQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'monthly-schedules', clubId],
    queryFn: () => homeApi.getMonthlySchedules(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: MONTHLY_SCHEDULES_STALE_TIME,
    gcTime: MONTHLY_SCHEDULES_GC_TIME,
  });
}
