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
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts'] }),
      ]);
      toast({ title: '게시글이 삭제되었습니다.', variant: 'success' });
    },
    onError: (error) => {
      if (error.message !== 'club not found') {
        toast({ title: '게시글 삭제에 실패했습니다.', variant: 'error' });
      }
    },
  });

  const deletePost = (postId: number, onSuccess?: () => void) => {
    return mutation.mutateAsync(postId, { onSuccess: () => onSuccess?.() });
  };

  return { deletePost, isPending: mutation.isPending };
}
