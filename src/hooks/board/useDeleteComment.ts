import { commentApi } from '@/lib/apis/comment';
import { useCommentMutation } from './useCommentMutation';

export function useDeleteComment(boardId: number, postId: number) {
  const mutation = useCommentMutation({
    boardId,
    postId,
    mutationFn: (commentId: number) => commentApi.delete(postId, commentId),
    successMessage: '댓글이 삭제되었습니다.',
    errorMessage: '댓글 삭제에 실패했습니다.',
    invalidatePostList: true,
  });

  const deleteComment = (commentId: number) => {
    if (mutation.isPending) return;
    mutation.mutate(commentId);
  };

  return { deleteComment, isPending: mutation.isPending };
}
