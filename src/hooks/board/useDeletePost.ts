import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { deletePost } from '@/lib/actions/board';
import { useClubId } from '@/stores/useClubStore';
import { toast } from '@/stores/useToastStore';

/**
 * 게시글 삭제 Server Action 호출 훅
 *
 * - clubId(store) + postId(인자)로 deletePost Server Action 호출
 * - 성공 시 게시글 목록/홈 최근 게시글 React Query 캐시 무효화
 * - 성공/실패 토스트 노출
 */
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
