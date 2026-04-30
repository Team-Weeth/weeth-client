import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { COMMENT_ACTION_ERRORS } from '@/constants/board/error';
import { toast } from '@/stores/useToastStore';
import { useClubId } from '@/stores';

interface UseCommentMutationOptions<TVariables> {
  boardId: number;
  postId: number;
  mutationFn: (variables: TVariables) => Promise<unknown>;
  successMessage: string;
  errorMessage: string;
}

export function useCommentMutation<TVariables>({
  boardId,
  postId,
  mutationFn,
  successMessage,
  errorMessage,
}: UseCommentMutationOptions<TVariables>) {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'detail', clubId, boardId, postId] });
      toast({ title: successMessage, variant: 'success' });
    },
    onError: (error) => {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      const message = (code && COMMENT_ACTION_ERRORS[code]) || errorMessage;
      toast({ title: message, variant: 'error' });
    },
  });
}
