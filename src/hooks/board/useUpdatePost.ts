import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { updatePost as updatePostApi } from '@/lib/actions/board';
import { resolveFilesPayload } from './resolveFilesPayload';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { validatePost } from './validatePost';

export function useUpdatePost() {
  const router = useRouter();
  const clubId = useClubId();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const updatePost = async (postId: number) => {
    const { title, content, files, _snapshot, reset } = usePostStore.getState();

    if (!validatePost({ clubId, title, content, files })) return;

    const uploadedFiles = files.filter((f) => f.uploaded);
    const filesPayload = resolveFilesPayload(uploadedFiles, _snapshot?.fileIds ?? null);

    setIsPending(true);
    try {
      await updatePostApi(clubId!, postId, { title, content, files: filesPayload });

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

  return { updatePost, isPending };
}
