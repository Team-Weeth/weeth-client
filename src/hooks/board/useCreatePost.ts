import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { createPost as createPostApi } from '@/lib/actions/board';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { validatePost } from './validatePost';

export function useCreatePost() {
  const router = useRouter();
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const createPost = async () => {
    const { board, title, content, files, getPayload, reset } = usePostStore.getState();

    if (!board) {
      toast({ title: '게시판을 선택해주세요.', variant: 'error' });
      return;
    }

    if (!validatePost({ clubId, title, content, files })) return;

    setIsPending(true);
    try {
      const payload = getPayload();
      const result = await createPostApi(clubId!, board, payload);

      await queryClient.invalidateQueries({ queryKey: ['posts'] });

      toast({ title: '게시글이 작성되었습니다.', variant: 'success' });
      reset();
      router.push(`/board/${result.id}`);
    } catch {
      toast({ title: '게시글 작성에 실패했습니다.', variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { createPost, isPending };
}
