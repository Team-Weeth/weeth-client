import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys } from './adminQueryKeys';
import { useClubId } from '@/stores';
import { duesApi } from '@/lib/apis';

export function useAdminDuesTransactionsQuery(accountId: number) {
  const clubId = useClubId();
  return useQuery({
    queryKey: adminQueryKeys.duesTransactions(clubId!, accountId),
    queryFn: () => duesApi.getTransactions(clubId!, accountId).then((res) => res.data.data),
    enabled: !!clubId,
    staleTime: 5 * 60 * 1000,
  });
}
