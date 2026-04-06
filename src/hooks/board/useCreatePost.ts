import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/lib/actions/board';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';

/**
 * 게시글 작성 Server Action 호출 훅
 *
 * - usePostStore에서 board, payload를 꺼내 createPost Server Action 호출
 * - 성공 시 store reset + 게시글 상세로 이동
 * - 업로드 미완료 파일이 있으면 제출 차단
 */
export function useCreatePost() {
  const router = useRouter();
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const submit = async () => {
    const { board, title, content, files, getPayload, reset } = usePostStore.getState();

    if (!clubId) {
      toast({ title: '클럽 정보를 불러올 수 없습니다.', variant: 'error' });
      return;
    }

    if (!board) {
      toast({ title: '게시판을 선택해주세요.', variant: 'error' });
      return;
    }

    if (!title.trim()) {
      toast({ title: '제목을 입력해주세요.', variant: 'error' });
      return;
    }

    if (!content.trim()) {
      toast({ title: '내용을 입력해주세요.', variant: 'error' });
      return;
    }

    const uploading = files.some((f) => !f.uploaded && f.file);
    if (uploading) {
      toast({ title: '파일 업로드가 진행 중입니다.', variant: 'error' });
      return;
    }

    setIsPending(true);
    try {
      const payload = getPayload();
      const result = await createPost(clubId, board, payload);
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

  return { submit, isPending };
}
