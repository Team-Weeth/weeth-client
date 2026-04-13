import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { commentApi } from '@/lib/apis/comment';
import { toast } from '@/stores/useToastStore';
import type { UploadFileItem } from '@/stores/usePostStore';

export function useCreateComment(postId: number) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const createComment = async (content: string, file: UploadFileItem | null) => {
    if (isPending) return;

    setIsPending(true);
    try {
      await commentApi.create(postId, {
        content,
        files: file
          ? [
              {
                fileName: file.fileName,
                storageKey: file.storageKey,
                fileSize: file.fileSize,
                contentType: file.contentType,
              },
            ]
          : [],
      });
      router.refresh();
      toast({ title: '댓글이 작성되었습니다.', variant: 'success' });
    } catch {
      toast({ title: '댓글 작성에 실패했습니다.', variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { createComment, isPending };
}
