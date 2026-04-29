import { commentApi } from '@/lib/apis/comment';
import { useCommentMutation } from './useCommentMutation';

export function useCreateComment(boardId: number, postId: number) {
  const mutation = useCommentMutation({
    boardId,
    postId,
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: number }) =>
      commentApi.create(postId, { content, files: [], parentCommentId }),
    successMessage: '댓글이 작성되었습니다.',
    errorMessage: '댓글 작성에 실패했습니다.',
  });

  const createComment = async (content: string, parentCommentId?: number): Promise<boolean> => {
    if (mutation.isPending) return false;
    try {
      await mutation.mutateAsync({ content, parentCommentId });
      return true;
    } catch {
      return false;
    }
  };

  return { createComment, isPending: mutation.isPending };
}
