import { useQuery } from '@tanstack/react-query';

import { attendanceApi } from '@/lib/apis/attendance';
import { ATTENDANCE_QR_GC_TIME } from '@/constants/attendance';

function useQRCode(clubId: string | null, sessionId: number | null) {
  return useQuery({
    queryKey: ['attendance', 'qr', clubId, sessionId],
    queryFn: async () => {
      const response = await attendanceApi.generateQR(clubId!, sessionId!);
      return response.data.data;
    },
    enabled: !!clubId && sessionId != null,
    staleTime: Infinity,
    gcTime: ATTENDANCE_QR_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export { useQRCode };
