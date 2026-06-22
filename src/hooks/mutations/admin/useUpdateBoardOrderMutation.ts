import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminBoardApi, getApiErrorMessage } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { MutationCallbacks } from '@/types/common';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';

export function useUpdateBoardOrderMutation(callbacks?: MutationCallbacks<unknown>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['admin', 'boards', 'reorder', clubId],
    mutationFn: (boardIds: number[]) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.updateBoardOrder(clubId, boardIds);
    },
    onSuccess: () => {
      toastSuccess('게시판 순서가 저장됐어요.');
      callbacks?.onSuccess?.();
    },
    onError: (err) => {
      toastError(getApiErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.boards(clubId) });
      callbacks?.onError?.(err);
    },
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
