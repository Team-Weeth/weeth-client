import type { UploadFileItem } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';
import { isHtmlEmpty } from '@/utils/shared';

interface ValidatePostParams {
  clubId: string | null;
  title: string;
  content: string;
  files: UploadFileItem[];
}

export function validatePost({ clubId, title, content, files }: ValidatePostParams): boolean {
  if (!clubId) {
    toast({ title: '클럽 정보를 불러올 수 없습니다.', variant: 'error' });
    return false;
  }

  if (!title.trim()) {
    toast({ title: '제목을 입력해주세요.', variant: 'error' });
    return false;
  }

  if (isHtmlEmpty(content)) {
    toast({ title: '내용을 입력해주세요.', variant: 'error' });
    return false;
  }

  const uploading = files.some((f) => !f.uploaded && f.file);
  if (uploading) {
    toast({ title: '파일 업로드가 진행 중입니다.', variant: 'error' });
    return false;
  }

  return true;
}
