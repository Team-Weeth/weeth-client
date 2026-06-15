import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminBoardApi } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';

export function useDeleteBoardMutation(callbacks?: MutationCallbacks<unknown>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'board', 'delete'],
    mutationFn: (boardId: number) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.deleteBoard(clubId, boardId);
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
