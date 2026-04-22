import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePost as updatePostApi } from '@/lib/actions/board';
import { resolveFilesPayload } from './resolveFilesPayload';
import { useClubId } from '@/stores/useClubStore';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { validatePost } from './validatePost';

export function useUpdatePost() {
  const router = useRouter();
  const { clubId: clubIdParam } = useParams<{ clubId: string }>();
  const clubId = useClubId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (postId: number) => {
      const { title, content, files, _snapshot } = usePostStore.getState();

      if (!validatePost({ clubId, title, content, files })) {
        throw new Error('validation failed');
      }

      const uploadedFiles = files.filter((f) => f.uploaded);
      const filesPayload = resolveFilesPayload(uploadedFiles, _snapshot?.fileIds ?? null);

      await updatePostApi(clubId!, postId, { title, content, files: filesPayload });
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-posts', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'recent-notices', clubId] });
      queryClient.invalidateQueries({ queryKey: ['home', 'unread-notice', clubId] });
      toast({ title: '게시글이 수정되었습니다.', variant: 'success' });
      usePostStore.getState().reset();
      router.push(`/${clubIdParam}/board/${postId}`);
    },
    onError: (error) => {
      if (error.message !== 'validation failed') {
        toast({ title: '게시글 수정에 실패했습니다.', variant: 'error' });
      }
    },
  });

  return {
    updatePost: (postId: number) => mutation.mutate(postId),
    isPending: mutation.isPending,
  };
}
