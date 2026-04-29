import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminBoardApi, type UpdateBoardBody } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';
import { adminBoardQueryKeys } from './boardQueryKeys';

export function useUpdateBoardMutation(callbacks?: MutationCallbacks<unknown>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'board', 'update'],
    mutationFn: ({ boardId, body }: { boardId: number; body: UpdateBoardBody }) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.updateBoard(clubId, boardId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBoardQueryKeys.list(clubId) });
      callbacks?.onSuccess?.();
    },
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
