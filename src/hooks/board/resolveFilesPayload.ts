import type { UploadFileItem } from '@/stores/usePostStore';
import type { CreatePostFile } from '@/types/board';

function resolveFilesPayload(
  uploadedFiles: UploadFileItem[],
  snapshotFileIds: string[] | null,
): CreatePostFile[] | null {
  const toCreatePostFile = (f: UploadFileItem): CreatePostFile => ({
    fileName: f.fileName,
    storageKey: f.storageKey,
    fileSize: f.fileSize,
    contentType: f.contentType,
  });

  if (snapshotFileIds === null) {
    return uploadedFiles.map(toCreatePostFile);
  }

  const currentExistingIds = uploadedFiles.filter((f) => f.isExisting).map((f) => f.id);
  const hasNewFiles = uploadedFiles.some((f) => !f.isExisting);
  const filesUnchanged =
    !hasNewFiles &&
    currentExistingIds.length === snapshotFileIds.length &&
    currentExistingIds.every((id, i) => id === snapshotFileIds[i]);

  return filesUnchanged ? null : uploadedFiles.map(toCreatePostFile);
}

export { resolveFilesPayload };
