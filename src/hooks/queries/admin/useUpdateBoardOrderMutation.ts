import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminBoardApi, getApiErrorMessage } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { MutationCallbacks } from '@/types/common';

export function useUpdateBoardOrderMutation(callbacks?: MutationCallbacks<AxiosError>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardIds: number[]) => adminBoardApi.updateBoardOrder(clubId!, boardIds),
    onSuccess: () => {
      toastSuccess('게시판 순서가 저장됐어요.');
      callbacks?.onSuccess?.();
    },
    onError: (err: AxiosError) => {
      toastError(getApiErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards', clubId] });
      callbacks?.onError?.(err);
    },
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
