import { useQuery } from '@tanstack/react-query';

import { adminScheduleApi } from '@/lib/apis/adminSchedule';
import { useClubId } from '@/stores';

export function useAdminSchedules(cardinalId: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['admin', 'schedules', clubId, cardinalId],
    queryFn: async () => {
      const res = await adminScheduleApi.getSchedules(clubId!, cardinalId!);
      return res.data.data;
    },
    enabled: !!clubId && cardinalId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
