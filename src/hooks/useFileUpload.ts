import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePostStore } from '@/stores/usePostStore';
import { MAX_FILES, MAX_FILE_SIZE } from '@/constants/file';

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i;

// 파일이 이미지인지 판별
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

/**
 * 게시글 파일 첨부를 관리하는 훅
 *
 * - 이미지/일반 파일 분류
 * - 파일 선택 input (picker) 제어
 * - 파일 크기 및 개수 제한 검증
 * - blob preview URL 생성 및 해제
 */

export function useFileUpload() {
  const { files, addFiles, removeFile } = usePostStore(
    useShallow((s) => ({ files: s.files, addFiles: s.addFiles, removeFile: s.removeFile })),
  );

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // TODO: toast 시스템 구축 후 setWarning 대신 toast 호출로 교체
  const [warning, setWarning] = useState<string | null>(null);

  const clearWarning = () => setWarning(null);

  const processFiles = (incoming: File[]) => {
    const warnings: string[] = [];

    const oversized = incoming.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      warnings.push(`${oversized.length}개 파일이 10MB를 초과하여 제외되었습니다.`);
    }

    const valid = incoming.filter((f) => f.size <= MAX_FILE_SIZE);
    const slots = MAX_FILES - files.length;

    if (valid.length > slots) {
      warnings.push(`최대 ${MAX_FILES}개까지 첨부할 수 있습니다. (${valid.length - slots}개 제외)`);
    }

    const toProcess = valid.slice(0, Math.max(0, slots));

    // TODO: 실제 업로드 API 연동 후 uploaded를 false → true로 전환
    addFiles(
      toProcess.map((file) => ({
        id: crypto.randomUUID(),
        file,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        uploaded: true,
      })),
    );

    setWarning(warnings.length > 0 ? warnings.join(' ') : null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const openImagePicker = () => imageInputRef.current?.click();
  const openFilePicker = () => fileInputRef.current?.click();

  // 파일 제거 시 blob URL 해제
  const handleRemoveFile = (id: string, fileUrl: string) => {
    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    removeFile(id);
  };

  // 이미지 파일 / 일반 파일 분리 (UI 표시용)
  const imageFiles = files.filter((f) => isImageFile(f.file));
  const nonImageFiles = files.filter((f) => !isImageFile(f.file));

  return {
    imageInputRef,
    fileInputRef,
    processFiles,
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
