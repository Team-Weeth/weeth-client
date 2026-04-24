import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminBoardApi, type CreateBoardBody } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';

export function useCreateBoardMutation(callbacks?: MutationCallbacks<AxiosError>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBoardBody) => adminBoardApi.createBoard(clubId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards', clubId] });
      callbacks?.onSuccess?.();
    },
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
