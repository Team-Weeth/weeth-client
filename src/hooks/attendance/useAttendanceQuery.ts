import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/apis/attendance';
import { useClubId } from '@/stores/useClubStore';

export function useAttendanceQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['attendance', clubId],
    queryFn: () => attendanceApi.getAttendance(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: Infinity, // 출석 제출 mutation에서 invalidate해 갱신
  });
}
