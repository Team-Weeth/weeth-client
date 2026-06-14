import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost as createPostApi } from '@/lib/actions/board';
import { BOARD_ACTION_ERRORS } from '@/constants/board/error';
import { parseApiError } from '@/lib/error';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { buildPostPath } from '@/lib/board';
import { validatePost } from './validatePost';

export function useCreatePost() {
  const router = useRouter();
  const { clubId: clubIdParam } = useParams<{ clubId: string }>();
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

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
      const { _allowNavigation } = usePostStore.getState();
      queryClient.invalidateQueries({ queryKey: ['posts', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-notices', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'unread-notice', clubId] });
      _allowNavigation?.();
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(buildPostPath(clubIdParam, result.id, result.boardId));
      }, 0);
      usePostStore.getState().reset();
      toast({ title: '게시글이 작성되었습니다.', variant: 'success' });
    },
    onError: (error) => {
      if (error.message === 'board not selected' || error.message === 'validation failed') return;
      const parsed = error instanceof Error ? parseApiError(error) : null;
      const message =
        (parsed?.code && BOARD_ACTION_ERRORS[parsed.code]) || '게시글 작성에 실패했습니다.';
      toast({ title: message, variant: 'error' });
    },
  });

  return { createPost: () => mutation.mutate(), isPending: mutation.isPending || isRedirecting };
}
