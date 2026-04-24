import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminBoardApi, type CreateBoardBody } from '@/lib/apis/adminBoard';
import { useClubId } from '@/stores';

export function useCreateBoardMutation() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBoardBody) => adminBoardApi.createBoard(clubId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards', clubId] });
    },
  });
}
