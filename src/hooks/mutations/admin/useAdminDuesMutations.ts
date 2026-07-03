import { duesApi } from '@/lib/apis';
import { useClubId } from '@/stores';
import { MutationCallbacks } from '@/types';
import { TransactionBody } from '@/types/admin/dues';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateTransction(
  accounId: number,
  body: TransactionBody,
  callbacks?: MutationCallbacks<unknown>,
) {
  const clubId = useClubId();
  const QueryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TransactionBody) => duesApi.createTransaction(clubId!, accounId, body),
  });
}
