import { useQuery } from '@tanstack/react-query';

import { attendanceApi } from '@/lib/apis/attendance';

function useQRCode(clubId: string | null, sessionId: number) {
  return useQuery({
    queryKey: ['attendance', 'qr', sessionId],
    queryFn: async () => {
      const response = await attendanceApi.generateQR(clubId!, sessionId);
      return response.data.data;
    },
    enabled: !!clubId,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export { useQRCode };
