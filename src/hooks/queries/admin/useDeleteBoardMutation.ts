import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminBoardApi } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';
import { adminBoardQueryKeys } from './boardQueryKeys';

export function useDeleteBoardMutation(callbacks?: MutationCallbacks<AxiosError>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: number) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.deleteBoard(clubId, boardId);
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
