import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { deletePost } from '@/lib/actions/board';
import { useClubId } from '@/stores/useClubStore';
import { toast } from '@/stores/useToastStore';

export function useDeletePost() {
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const submit = async (postId: number, onSuccess?: () => void) => {
    if (!clubId) {
      toast({ title: '클럽 정보를 불러올 수 없습니다.', variant: 'error' });
      return;
    }

    setIsPending(true);
    try {
      await deletePost(clubId, postId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts'] }),
      ]);
      toast({ title: '게시글이 삭제되었습니다.', variant: 'success' });
      onSuccess?.();
    } catch {
      toast({ title: '게시글 삭제에 실패했습니다.', variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { submit, isPending };
}
