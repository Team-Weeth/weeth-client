import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost as updatePostApi } from '@/lib/actions/board';
import { BOARD_ACTION_ERRORS } from '@/constants/board/error';
import { parseApiError } from '@/lib/error';
import { resolveFilesPayload } from './resolveFilesPayload';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { buildPostPath } from '@/lib/board';
import { validatePost } from './validatePost';

export function useUpdatePost() {
  const router = useRouter();
  const { clubId: clubIdParam } = useParams<{ clubId: string }>();
  const clubId = useClubId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      const { board, title, content, files, _snapshot } = usePostStore.getState();

      if (!board) {
        toast({ title: '게시판을 선택해주세요.', variant: 'error' });
        throw new Error('board not selected');
      }

      if (!validatePost({ clubId, title, content, files })) {
        throw new Error('validation failed');
      }

      const uploadedFiles = files.filter((f) => f.uploaded);
      const filesPayload = resolveFilesPayload(uploadedFiles, _snapshot?.fileIds ?? null);

      return updatePostApi(clubId!, board, postId, { title, content, files: filesPayload });
    },
    onSuccess: (result) => {
      const { _allowNavigation } = usePostStore.getState();
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-notices', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'unread-notice', clubId] });
      toast({ title: '게시글이 수정되었습니다.', variant: 'success' });
      _allowNavigation?.();
      router.push(buildPostPath(clubIdParam, result.id, result.boardId));
      usePostStore.getState().reset();
    },
    onError: (error) => {
      if (error.message === 'board not selected' || error.message === 'validation failed') return;
      const parsed = error instanceof Error ? parseApiError(error) : null;
      const message =
        (parsed?.code && BOARD_ACTION_ERRORS[parsed.code]) || '게시글 수정에 실패했습니다.';
      toast({ title: message, variant: 'error' });
    },
  });

  return {
    updatePost: (postId: number) => mutation.mutate(postId),
    isPending: mutation.isPending,
  };
}
