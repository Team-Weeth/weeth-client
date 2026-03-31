import type { FileAttachment } from '@/types/home';
import type { FileItem } from '@/stores/usePostStore';

export function fileAttachmentToFileItem(file: FileAttachment): FileItem {
  return {
    id: String(file.fileId),
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    uploaded: true,
  };
}
