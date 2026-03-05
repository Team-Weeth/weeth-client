import { useCallback, useMemo, useRef, useState } from 'react';
import { usePostStore } from '@/stores/usePostStore';
import { MAX_FILES, MAX_FILE_SIZE } from '@/constants/file';
const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i;

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

export function useFileUpload() {
  const files = usePostStore((s) => s.files);
  const addFile = usePostStore((s) => s.addFile);
  const removeFile = usePostStore((s) => s.removeFile);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // TODO: toast 시스템 구축 후 setWarning 대신 toast 호출로 교체
  const [warning, setWarning] = useState<string | null>(null);

  const clearWarning = useCallback(() => setWarning(null), []);

  const processFiles = useCallback(
    (incoming: File[]) => {
      const warnings: string[] = [];

      const oversized = incoming.filter((f) => f.size > MAX_FILE_SIZE);
      if (oversized.length > 0) {
        warnings.push(`${oversized.length}개 파일이 10MB를 초과하여 제외되었습니다.`);
      }

      const valid = incoming.filter((f) => f.size <= MAX_FILE_SIZE);
      const slots = MAX_FILES - files.length;

      if (valid.length > slots) {
        warnings.push(
          `최대 ${MAX_FILES}개까지 첨부할 수 있습니다. (${valid.length - slots}개 제외)`,
        );
      }

      const toProcess = valid.slice(0, Math.max(0, slots));

      for (const file of toProcess) {
        const previewUrl = URL.createObjectURL(file);
        // TODO: 실제 업로드 API 연동 후 uploaded를 false → true로 전환
        addFile({
          id: crypto.randomUUID(),
          file,
          fileName: file.name,
          fileUrl: previewUrl,
          uploaded: true,
        });
      }

      setWarning(warnings.length > 0 ? warnings.join(' ') : null);
    },
    [files.length, addFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(Array.from(e.target.files));
      e.target.value = '';
    },
    [processFiles],
  );

  const openImagePicker = useCallback(() => imageInputRef.current?.click(), []);
  const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

  const handleRemoveFile = useCallback(
    (id: string, fileUrl: string) => {
      if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
      removeFile(id);
    },
    [removeFile],
  );

  const imageFiles = useMemo(() => files.filter((f) => isImageFile(f.file)), [files]);
  const nonImageFiles = useMemo(() => files.filter((f) => !isImageFile(f.file)), [files]);

  return {
    imageInputRef,
    fileInputRef,
    picker: {
      openImagePicker,
      openFilePicker,
    },
    files: {
      imageFiles,
      nonImageFiles,
      handleRemoveFile,
    },
    warning: {
      message: warning,
      clear: clearWarning,
    },
    handlers: {
      handleInputChange,
    },
  };
}
