import { commentApi } from '@/lib/apis/comment';
import type { CreatePostFile } from '@/types/file';
import { useCommentMutation } from './useCommentMutation';

export function useUpdateComment(boardId: number, postId: number) {
  const mutation = useCommentMutation({
    boardId,
    postId,
    mutationFn: ({
      commentId,
      content,
      files,
    }: {
      commentId: number;
      content: string;
      files: CreatePostFile[] | null;
    }) => commentApi.update(postId, commentId, { content, files }),
    successMessage: '댓글이 수정되었습니다.',
    errorMessage: '댓글 수정에 실패했습니다.',
  });

  const updateComment = async (
    commentId: number,
    content: string,
    files: CreatePostFile[] | null = null,
  ): Promise<boolean> => {
    if (mutation.isPending) return false;
    try {
      await mutation.mutateAsync({ commentId, content, files });
      return true;
    } catch {
      return false;
    }
  };

  return { updateComment, isPending: mutation.isPending };
}
