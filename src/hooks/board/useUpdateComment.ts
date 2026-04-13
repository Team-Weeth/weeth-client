import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { commentApi } from '@/lib/apis/comment';
import { toast } from '@/stores/useToastStore';
import type { UploadFileItem } from '@/stores/usePostStore';

export function useUpdateComment(postId: number) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const updateComment = async (
    commentId: number,
    content: string,
    file: UploadFileItem | null,
    existingFilesRemoved: boolean,
  ) => {
    if (isPending) return;

    setIsPending(true);
    try {
      // file 있음 → 새 파일로 교체
      // file 없음 + 기존 파일 삭제함 → 빈 배열(전체 삭제)
      // file 없음 + 기존 파일 유지 → null(변경 없음)
      let files: { fileName: string; storageKey: string; fileSize: number; contentType: string }[] | null = null;

      if (file) {
        files = [
          {
            fileName: file.fileName,
            storageKey: file.storageKey,
            fileSize: file.fileSize,
            contentType: file.contentType,
          },
        ];
      } else if (existingFilesRemoved) {
        files = [];
      }

      await commentApi.update(postId, commentId, { content, files });
      router.refresh();
      toast({ title: '댓글이 수정되었습니다.', variant: 'success' });
    } catch {
      toast({ title: '댓글 수정에 실패했습니다.', variant: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  return { updateComment, isPending };
}
