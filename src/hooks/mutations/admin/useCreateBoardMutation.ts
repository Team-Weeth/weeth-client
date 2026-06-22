import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminBoardApi, type CreateBoardBody } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';

export function useCreateBoardMutation(callbacks?: MutationCallbacks<unknown>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'board', 'create'],
    mutationFn: (body: CreateBoardBody) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.createBoard(clubId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.boards(clubId) });
      callbacks?.onSuccess?.();
    },
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
