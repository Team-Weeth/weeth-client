import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { COMMENT_ACTION_ERRORS } from '@/constants/board/error';
import { commentApi } from '@/lib/apis/comment';
import { toast } from '@/stores/useToastStore';

export function useUpdateComment(postId: number) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const updateComment = async (commentId: number, content: string) => {
    if (isPending) return;

    setIsPending(true);
    try {
      await commentApi.update(postId, commentId, { content, files: null });
      router.refresh();
      toast({ title: '댓글이 수정되었습니다.', variant: 'success' });
    } catch (error) {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      const message = (code && COMMENT_ACTION_ERRORS[code]) || '댓글 수정에 실패했습니다.';
      toast({ title: message, variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { updateComment, isPending };
}
