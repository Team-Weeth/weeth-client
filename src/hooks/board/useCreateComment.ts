import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { COMMENT_ACTION_ERRORS } from '@/constants/board/error';
import { commentApi } from '@/lib/apis/comment';
import { toast } from '@/stores/useToastStore';

export function useCreateComment(postId: number) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const createComment = async (content: string, parentCommentId?: number): Promise<boolean> => {
    if (isPending) return false;

    setIsPending(true);
    try {
      await commentApi.create(postId, { content, files: [], parentCommentId });
      router.refresh();
      toast({ title: '댓글이 작성되었습니다.', variant: 'success' });
      return true;
    } catch (error) {
      const code = isAxiosError(error) ? error.response?.data?.code : undefined;
      const message = (code && COMMENT_ACTION_ERRORS[code]) || '댓글 작성에 실패했습니다.';
      toast({ title: message, variant: 'error' });
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { createComment, isPending };
}
