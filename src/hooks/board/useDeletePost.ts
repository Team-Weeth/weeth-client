import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost as deletePostApi } from '@/lib/actions/board';
import { useClubId } from '@/stores/useClubStore';
import { toast } from '@/stores/useToastStore';

export function useDeletePost() {
  const clubId = useClubId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      if (!clubId) {
        toast({ title: '클럽 정보를 불러올 수 없습니다.', variant: 'error' });
        throw new Error('club not found');
      }
      await deletePostApi(clubId, postId);
      return postId;
    },
    onError: (error) => {
      if (error.message !== 'club not found') {
        toast({ title: '게시글 삭제에 실패했습니다.', variant: 'error' });
      }
    },
  });

  const deletePost = async (postId: number, onSuccess?: () => void) => {
    await mutation.mutateAsync(postId);
    // 상세 쿼리 캐시를 즉시 제거해 삭제된 게시글 refetch 방지
    queryClient.removeQueries({ queryKey: ['posts', 'detail'] });
    toast({ title: '게시글이 삭제되었습니다.', variant: 'success' });
    // 리다이렉트 먼저 실행
    onSuccess?.();
    // 목록/홈 쿼리는 백그라운드에서 갱신
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts'] });
  };

  return { deletePost, isPending: mutation.isPending };
}
