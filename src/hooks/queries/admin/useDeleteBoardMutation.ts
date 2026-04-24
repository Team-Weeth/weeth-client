import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminBoardApi } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';

export function useDeleteBoardMutation(callbacks?: MutationCallbacks<AxiosError>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: number) => adminBoardApi.deleteBoard(clubId!, boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards', clubId] });
      callbacks?.onSuccess?.();
    },
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
