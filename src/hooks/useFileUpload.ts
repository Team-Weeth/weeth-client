import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { MAX_IMAGE_FILES, MAX_NON_IMAGE_FILES } from '@/constants/board/file';
import type { OwnerType } from '@/lib/apis/file';
import { isImageFileName } from '@/lib/board/fileUtils';
import { useFileUploadCore } from '@/hooks/useFileUploadCore';
import { usePostStore } from '@/stores/usePostStore';
export function useFileUpload(ownerType: OwnerType = 'POST') {
  const { files, addFiles, markUploaded, removeFile } = usePostStore(
    useShallow((s) => ({
      files: s.files,
      addFiles: s.addFiles,
      markUploaded: s.markUploaded,
      removeFile: s.removeFile,
    })),
  );

  const imageInputRef = useRef<HTMLInputElement>(null);

  const core = useFileUploadCore({
    ownerType,
    maxImageFiles: MAX_IMAGE_FILES,
    maxNonImageFiles: MAX_NON_IMAGE_FILES,
    isAlive: (id) => usePostStore.getState().files.some((f) => f.id === id),
    removeFile,
    markUploaded,
    addFiles,
    getCurrentFiles: () => usePostStore.getState().files,
  });

  const imageFiles = files.filter((f) => isImageFileName(f.fileName));
  const nonImageFiles = files.filter((f) => !isImageFileName(f.fileName));

  return {
    imageInputRef,
    fileInputRef: core.fileInputRef,
    processFiles: core.processFiles,
    picker: {
      openImagePicker: () => imageInputRef.current?.click(),
      openFilePicker: () => core.fileInputRef.current?.click(),
    },
    files: {
      imageFiles,
      nonImageFiles,
      handleRemoveFile: core.handleRemoveFile,
    },
    handlers: {
      handleInputChange: core.handleInputChange,
    },
  };
}
