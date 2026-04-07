import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { updatePost } from '@/lib/actions/board';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { validatePost } from './validatePost';

/**
 * 게시글 수정 Server Action 호출 훅
 *
 * - usePostStore에서 title, content, files를 꺼내 updatePost Server Action 호출
 * - 성공 시 store reset + 게시글 상세로 이동
 * - 업로드 미완료 파일이 있으면 제출 차단
 */
export function useUpdatePost() {
  const router = useRouter();
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const submit = async (postId: number) => {
    const { title, content, files, getPayload, reset } = usePostStore.getState();

    if (!validatePost({ clubId, title, content, files })) return;

    setIsPending(true);
    try {
      await updatePost(clubId!, postId, getPayload(true));
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({ title: '게시글이 수정되었습니다.', variant: 'success' });
      reset();
      router.push(`/board/${postId}`);
    } catch {
      toast({ title: '게시글 수정에 실패했습니다.', variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { submit, isPending };
}
