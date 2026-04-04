import { useQuery } from '@tanstack/react-query';

import { cardinalApi } from '@/lib/apis';
import { CLUB_ID } from '@/hooks/queries/admin/useAdminMemberQueries';

export function useCardinals() {
  return useQuery({
    queryKey: ['cardinals', CLUB_ID],
    queryFn: async () => {
      const res = await cardinalApi.getCardinals(CLUB_ID);
      return res.data.data;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
