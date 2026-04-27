import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminBoardApi, getApiErrorMessage } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { MutationCallbacks } from '@/types/common';
import { adminBoardQueryKeys } from './boardQueryKeys';

export function useUpdateBoardOrderMutation(callbacks?: MutationCallbacks<AxiosError>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardIds: number[]) => {
      if (!clubId) throw new Error('clubId is required');
      return adminBoardApi.updateBoardOrder(clubId, boardIds);
    },
    onSuccess: () => {
      toastSuccess('게시판 순서가 저장됐어요.');
      callbacks?.onSuccess?.();
    },
    onError: (err: AxiosError) => {
      toastError(getApiErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: adminBoardQueryKeys.list(clubId) });
      callbacks?.onError?.(err);
    },
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
