import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminBoardApi, type UpdateBoardCommentBody } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';
import { adminBoardQueryKeys } from './boardQueryKeys';

export function useToggleBoardCommentMutation(callbacks?: MutationCallbacks<unknown>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'board', 'comment-toggle'],
    mutationFn: ({ boardId, body }: { boardId: number; body: UpdateBoardCommentBody }) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.updateBoardComment(clubId, boardId, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminBoardQueryKeys.list(clubId) });
      callbacks?.onSuccess?.();
    },
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
