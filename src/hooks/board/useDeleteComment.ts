import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { COMMENT_ACTION_ERRORS } from '@/constants/board/error';
import { commentApi } from '@/lib/apis/comment';
import { toast } from '@/stores/useToastStore';

export function useDeleteComment(postId: number) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const deleteComment = async (commentId: number) => {
    if (isPending) return;

    setIsPending(true);
    try {
      await commentApi.delete(postId, commentId);
      router.refresh();
      toast({ title: '댓글이 삭제되었습니다.', variant: 'success' });
    } catch (error) {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      const message = (code && COMMENT_ACTION_ERRORS[code]) || '댓글 삭제에 실패했습니다.';
      toast({ title: message, variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { deleteComment, isPending };
}
