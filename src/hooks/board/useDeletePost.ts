import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost as deletePostApi } from '@/lib/actions/board';
import { BOARD_ACTION_ERRORS } from '@/constants/board/error';
import { parseApiError } from '@/lib/error';
import { useClubId } from '@/stores/useClubStore';
import { toast } from '@/stores/useToastStore';

export function useDeletePost() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ boardId, postId }: { boardId: number; postId: number }) => {
      if (!clubId) {
        toast({ title: '클럽 정보를 불러올 수 없습니다.', variant: 'error' });
        throw new Error('club not found');
      }
      await deletePostApi(clubId, boardId, postId);
      return postId;
    },
    onSuccess: (_postId, { boardId, postId }) => {
      // 삭제된 게시글의 상세 쿼리만 즉시 제거해 refetch로 인한 에러 깜빡임 방지
      queryClient.removeQueries({ queryKey: ['posts', 'detail', clubId, boardId, postId] });
      toast({ title: '게시글이 삭제되었습니다.', variant: 'success' });
    },
    onError: (error) => {
      if (error.message === 'club not found') return;
      const parsed = error instanceof Error ? parseApiError(error) : null;
      const message =
        (parsed?.code && BOARD_ACTION_ERRORS[parsed.code]) || '게시글 삭제에 실패했습니다.';
      toast({ title: message, variant: 'error' });
    },
  });

  const deletePost = async (boardId: number, postId: number, onSuccess?: () => void) => {
    await mutation.mutateAsync({ boardId, postId });
    // 리다이렉트 먼저 실행
    onSuccess?.();
    // 목록/홈 쿼리는 백그라운드에서 갱신
    queryClient.invalidateQueries({ queryKey: ['posts', clubId] });
    queryClient.invalidateQueries({ queryKey: ['mypage', 'summary'] });
    queryClient.invalidateQueries({ queryKey: ['mypage', 'posts', clubId] });
    queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', clubId] });
    queryClient.invalidateQueries({ queryKey: ['home', 'recent-notices', clubId] });
    queryClient.invalidateQueries({ queryKey: ['home', 'unread-notice', clubId] });
  };

  return { deletePost, isPending: mutation.isPending };
}
