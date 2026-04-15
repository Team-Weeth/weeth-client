import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost as createPostApi } from '@/lib/actions/board';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { validatePost } from './validatePost';

export function useCreatePost() {
  const router = useRouter();
  const clubId = useClubId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { board, title, content, files, getPayload } = usePostStore.getState();

      if (!board) {
        toast({ title: '게시판을 선택해주세요.', variant: 'error' });
        throw new Error('board not selected');
      }

      if (!validatePost({ clubId, title, content, files })) {
        throw new Error('validation failed');
      }

      const payload = getPayload();
      return createPostApi(clubId!, board, payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: '게시글이 작성되었습니다.', variant: 'success' });
      usePostStore.getState().reset();
      router.push(`/board/${result.id}`);
    },
    onError: (error) => {
      if (error.message !== 'board not selected' && error.message !== 'validation failed') {
        toast({ title: '게시글 작성에 실패했습니다.', variant: 'error' });
      }
    },
  });

  return { createPost: () => mutation.mutate(), isPending: mutation.isPending };
}
