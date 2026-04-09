import type { FileAttachment } from '@/types/home';
import type { UploadFileItem } from '@/stores/usePostStore';

export function fileAttachmentToFileItem(file: FileAttachment): UploadFileItem {
  return {
    id: String(file.fileId),
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    storageKey: file.storageKey,
    uploaded: true,
  };
}
