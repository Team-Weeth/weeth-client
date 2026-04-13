import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { commentApi } from '@/lib/apis/comment';
import { toast } from '@/stores/useToastStore';

export function useCreateComment(postId: number) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const createComment = async (content: string, parentCommentId?: number) => {
    if (isPending) return;

    setIsPending(true);
    try {
      await commentApi.create(postId, { content, files: [], parentCommentId });
      router.refresh();
      toast({ title: '댓글이 작성되었습니다.', variant: 'success' });
    } catch {
      toast({ title: '댓글 작성에 실패했습니다.', variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { createComment, isPending };
}
