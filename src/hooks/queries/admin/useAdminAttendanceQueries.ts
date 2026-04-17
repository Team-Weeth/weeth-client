import { useQuery } from '@tanstack/react-query';

import { adminAttendanceApi } from '@/lib/apis/adminAttendance';
import { useClubId } from '@/stores';

export function useAdminSessions(cardinal: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['admin', 'sessions', clubId, cardinal],
    queryFn: async () => {
      const res = await adminAttendanceApi.getSessions(clubId!, cardinal!);
      return res.data.data;
    },
    enabled: !!clubId && cardinal !== null,
  });
}

export function useAdminAttendance(sessionId: number | null) {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['admin', 'attendance', clubId, sessionId],
    queryFn: async () => {
      const res = await adminAttendanceApi.getAttendanceBySession(clubId!, sessionId!);
      return res.data.data;
    },
    enabled: !!clubId && sessionId !== null,
  });
}
