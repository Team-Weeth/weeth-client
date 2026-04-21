import { useQuery } from '@tanstack/react-query';

import { attendanceApi } from '@/lib/apis/attendance';

function useQRCode(clubId: string | null, sessionId: number) {
  return useQuery({
    queryKey: ['attendance', 'qr', clubId, sessionId],
    queryFn: async () => {
      const response = await attendanceApi.generateQR(clubId!, sessionId);
      return response.data.data;
    },
    enabled: !!clubId,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export { useQRCode };
