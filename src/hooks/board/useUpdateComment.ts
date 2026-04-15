import { commentApi } from '@/lib/apis/comment';
import { useCommentMutation } from './useCommentMutation';

export function useUpdateComment(postId: number) {
  const mutation = useCommentMutation({
    postId,
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.update(postId, commentId, { content, files: null }),
    successMessage: '댓글이 수정되었습니다.',
    errorMessage: '댓글 수정에 실패했습니다.',
  });

  const updateComment = async (commentId: number, content: string): Promise<boolean> => {
    if (mutation.isPending) return false;
    try {
      await mutation.mutateAsync({ commentId, content });
      return true;
    } catch {
      return false;
    }
  };

  return { updateComment, isPending: mutation.isPending };
}
