import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost as updatePostApi } from '@/lib/actions/board';
import { BOARD_ACTION_ERRORS } from '@/constants/board/error';
import { parseApiError } from '@/lib/error';
import { resolveFilesPayload } from './resolveFilesPayload';
import { useClubId } from '@/stores/useClubStore';
import type { UploadFileItem } from '@/stores/usePostStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { buildPostPath } from '@/lib/board';
import { validatePost } from './validatePost';

/**
 * 에디터 HTML 내 <img src="..."> 출현 순서에 맞게 파일 목록을 정렬한다.
 * 이미지 파일은 HTML 등장 순서대로, 이미지가 아닌 파일은 상대 순서를 유지한다.
 */
function sortByContentImageOrder(files: UploadFileItem[], content: string): UploadFileItem[] {
  const srcPattern = /<img[^>]+src="([^"]+)"/g;
  const orderedUrls: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = srcPattern.exec(content)) !== null) {
    if (!orderedUrls.includes(match[1])) orderedUrls.push(match[1]);
  }
  if (orderedUrls.length === 0) return files;

  const rank = (fileUrl: string): number => {
    const idx = orderedUrls.findIndex(
      (u) =>
        u === fileUrl || u.replace(/%20/gi, ' ') === fileUrl || u === fileUrl.replace(/ /g, '%20'),
    );
    return idx === -1 ? Infinity : idx;
  };

  return [...files].sort((a, b) => {
    const ra = rank(a.fileUrl);
    const rb = rank(b.fileUrl);
    if (ra === Infinity && rb === Infinity) return 0;
    return ra - rb;
  });
}

export function useUpdatePost() {
  const router = useRouter();
  const { clubId: clubIdParam } = useParams<{ clubId: string }>();
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = useState(false);

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

      const uploadedFiles = sortByContentImageOrder(
        files.filter((f) => f.uploaded),
        content,
      );
      const filesPayload = resolveFilesPayload(uploadedFiles, _snapshot?.fileIds ?? null);

      return updatePostApi(clubId!, board, postId, { title, content, files: filesPayload });
    },
    onSuccess: (result) => {
      const { _allowNavigation } = usePostStore.getState();
      queryClient.removeQueries({
        queryKey: ['posts', 'detail', clubId, result.boardId, result.id],
      });
      queryClient.invalidateQueries({ queryKey: ['posts', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-notices', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'unread-notice', clubId] });
      toast({ title: '게시글이 수정되었습니다.', variant: 'success' });
      _allowNavigation?.();
      setIsRedirecting(true);
      setTimeout(() => {
        router.push(buildPostPath(clubIdParam, result.id, result.boardId));
      }, 0);
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
    isPending: mutation.isPending || isRedirecting,
  };
}
