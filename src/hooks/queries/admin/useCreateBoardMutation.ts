import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminBoardApi, type CreateBoardBody } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';
import { adminBoardQueryKeys } from './boardQueryKeys';

export function useCreateBoardMutation(callbacks?: MutationCallbacks<AxiosError>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBoardBody) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.createBoard(clubId, body);
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
