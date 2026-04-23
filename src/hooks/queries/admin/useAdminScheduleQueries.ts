import { useQuery } from '@tanstack/react-query';

import { adminScheduleApi } from '@/lib/apis/adminSchedule';
import { useClubId } from '@/stores';

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
