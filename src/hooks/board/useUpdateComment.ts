import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    } catch {
      toast({ title: '댓글 수정에 실패했습니다.', variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { updateComment, isPending };
}
