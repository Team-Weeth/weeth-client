import type { FileItem } from '@/types/file';
import type { UploadFileItem } from '@/stores/usePostStore';

export function fileAttachmentToFileItem(file: FileItem): UploadFileItem {
  return {
    id: String(file.fileId),
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    storageKey: file.storageKey,
    fileSize: file.fileSize,
    contentType: file.contentType,
    uploaded: true,
  };
}
