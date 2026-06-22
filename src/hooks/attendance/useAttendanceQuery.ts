import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/apis/attendance';
import { ATTENDANCE_STALE_TIME, ATTENDANCE_GC_TIME } from '@/constants/attendance';
import { useClubId } from '@/stores/useClubStore';

export function useAttendanceQuery() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['attendance', clubId],
    queryFn: () => attendanceApi.getAttendance(clubId!).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: ATTENDANCE_STALE_TIME,
    gcTime: ATTENDANCE_GC_TIME,
  });
}
