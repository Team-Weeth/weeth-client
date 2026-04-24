import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { adminBoardApi, type UpdateBoardBody } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';
import type { MutationCallbacks } from '@/types/common';

export function useUpdateBoardMutation(callbacks?: MutationCallbacks<AxiosError>) {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, body }: { boardId: number; body: UpdateBoardBody }) =>
      adminBoardApi.updateBoard(clubId!, boardId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards', clubId] });
      callbacks?.onSuccess?.();
    },
    onError: callbacks?.onError,
    onMutate: callbacks?.onMutate,
    onSettled: callbacks?.onSettled,
  });
}
