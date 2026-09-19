import { useRef, useState } from 'react';
import { isImageFileName } from '@/lib/board/fileUtils';
import { useFileUploadCore, type CoreFileItem } from '@/hooks/useFileUploadCore';
import type { CreatePostFile } from '@/types/file';

/**
 * 댓글 파일 첨부를 관리하는 훅 (인스턴스별 로컬 state)
 *
 * useFileUpload와 달리 usePostStore를 사용하지 않아
 * 여러 CommentInput이 동시에 렌더링되어도 파일 목록이 격리
 * - 파일/이미지 합산 최대 1개
 */
export function useCommentFileUpload() {
  const [files, setFiles] = useState<CoreFileItem[]>([]);
  const filesRef = useRef<CoreFileItem[]>([]);

  const core = useFileUploadCore({
    ownerType: 'COMMENT',
    maxImageFiles: 1,
    maxNonImageFiles: 1,
    maxTotalFiles: 1,
    isAlive: (id) => filesRef.current.some((f) => f.id === id),
    removeFile: (id) => {
      filesRef.current = filesRef.current.filter((f) => f.id !== id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    markUploaded: (id, storageKey, fileUrl) => {
      filesRef.current = filesRef.current.map((f) =>
        f.id === id ? { ...f, storageKey, fileUrl, uploaded: true } : f,
      );
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, storageKey, fileUrl, uploaded: true } : f)),
      );
    },
    addFiles: (newFiles) => {
      filesRef.current = [...filesRef.current, ...newFiles];
      setFiles((prev) => [...prev, ...newFiles]);
    },
    getCurrentFiles: () => filesRef.current,
  });

  const clearFiles = () => {
    filesRef.current.forEach((f) => {
      if (f.fileUrl.startsWith('blob:')) URL.revokeObjectURL(f.fileUrl);
    });
    filesRef.current = [];
    setFiles([]);
  };

  const getUploadedFiles = (): CreatePostFile[] =>
    filesRef.current
      .filter((f) => f.uploaded)
      .map((f) => ({
        fileName: f.fileName,
        storageKey: f.storageKey,
        fileSize: f.fileSize,
        contentType: f.contentType,
      }));

  return {
    fileInputRef: core.fileInputRef,
    files: {
      imageFiles: files.filter((f) => isImageFileName(f.fileName)),
      nonImageFiles: files.filter((f) => !isImageFileName(f.fileName)),
      handleRemoveFile: core.handleRemoveFile,
    },
    handlers: { handleInputChange: core.handleInputChange },
    picker: { openFilePicker: () => core.fileInputRef.current?.click() },
    clearFiles,
    getUploadedFiles,
  };
}
