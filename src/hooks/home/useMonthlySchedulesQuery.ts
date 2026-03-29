import { useQuery } from '@tanstack/react-query';
import { homeApi } from '@/lib/apis/home';
import { useClubId } from '@/stores/useClubStore';

export function useMonthlySchedulesQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['home', 'monthly-schedules', clubId],
    queryFn: () => homeApi.getMonthlySchedules(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
  });
}
