import { useQuery } from '@tanstack/react-query';

import { cardinalApi } from '@/lib/apis/cardinal';
import { useClubId } from '@/stores';

export function useCardinals() {
  const clubId = useClubId();

  return useQuery({
    queryKey: ['cardinals', clubId],
    queryFn: async () => {
      const res = await cardinalApi.getCardinals(clubId!);
      return res.data.data;
    },
    enabled: !!clubId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
