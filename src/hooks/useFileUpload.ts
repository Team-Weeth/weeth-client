import { useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  MAX_IMAGE_FILES,
  MAX_NON_IMAGE_FILES,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
} from '@/constants/board/file';
import { fileApi } from '@/lib/apis/file';
import type { OwnerType } from '@/lib/apis/file';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i;

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

function isImageFileName(fileName: string): boolean {
  return IMAGE_EXTENSIONS.test(fileName);
}

function getExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function isAllowedExtension(fileName: string): boolean {
  const ext = getExtension(fileName);
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * 게시글 파일 첨부를 관리하는 훅
 *
 * - 허용 확장자 검증 (png, jpg, jpeg, pdf, webp)
 * - 이미지/일반 파일 분류
 * - 파일 크기 및 개수 제한 검증
 * - presigned URL 요청 → S3 업로드 → storageKey 저장
 */
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortMap = useRef<Map<string, AbortController>>(new Map());

  const isFileInStore = (id: string) => usePostStore.getState().files.some((f) => f.id === id);

  const uploadToS3 = async (filesToUpload: { id: string; file: File }[]) => {
    // presigned URL 요청 전에 이미 삭제된 파일 제외
    const alive = filesToUpload.filter(({ id }) => isFileInStore(id));
    if (alive.length === 0) return;

    let presignedUrls;
    try {
      const fileNames = alive.map((f) => f.file.name);
      const { data } = await fileApi.getPresignedUrls(ownerType, fileNames);
      presignedUrls = data.data;
    } catch {
      toast({ title: '파일 업로드에 실패했습니다.', variant: 'error' });
      alive.forEach(({ id }) => removeFile(id));
      return;
    }

    // fileName 기반 매칭 (인덱스 순서 의존 제거)
    const remaining = [...presignedUrls];
    const results = await Promise.allSettled(
      alive.map(async ({ id, file }) => {
        // PUT 직전 store 존재 여부 재확인
        if (!isFileInStore(id)) return;

        const idx = remaining.findIndex((p) => p.fileName === file.name);
        if (idx === -1) throw new Error(`No presigned URL for ${file.name}`);
        const presigned = remaining.splice(idx, 1)[0];

        const controller = new AbortController();
        uploadAbortMap.current.set(id, controller);

        try {
          const res = await fetch(presigned.putUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`Upload failed (${res.status})`);

          // 업로드 완료 후에도 store에 남아있는지 확인
          if (isFileInStore(id)) {
            const fileUrl = presigned.putUrl.split('?')[0];
            markUploaded(id, presigned.storageKey, fileUrl);
          }
        } finally {
          uploadAbortMap.current.delete(id);
        }
      }),
    );

    const failedIds = results
      .map((r, i) => {
        if (r.status === 'rejected' && r.reason?.name !== 'AbortError') {
          return alive[i].id;
        }
        return null;
      })
      .filter((id): id is string => id !== null && isFileInStore(id));

    if (failedIds.length > 0) {
      failedIds.forEach((id) => removeFile(id));
      toast({ title: `${failedIds.length}개 파일 업로드에 실패했습니다.`, variant: 'error' });
    }
  };

  const processFiles = (incoming: File[]) => {
    // 확장자 검증
    const invalidExt = incoming.filter((f) => !isAllowedExtension(f.name));
    if (invalidExt.length > 0) {
      toast({
        title: `허용되지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')})`,
        variant: 'error',
      });
    }
    const extValid = incoming.filter((f) => isAllowedExtension(f.name));

    // 파일 크기 검증
    const oversized = extValid.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast({
        title: `${oversized.length}개 파일이 10MB를 초과합니다.`,
        variant: 'error',
      });
    }
    const valid = extValid.filter((f) => f.size <= MAX_FILE_SIZE);

    const incomingImages = valid.filter((f) => isImageFile(f));
    const incomingNonImages = valid.filter((f) => !isImageFile(f));

    const currentFiles = usePostStore.getState().files;
    const currentImageCount = currentFiles.filter((f) => isImageFileName(f.fileName)).length;
    const currentNonImageCount = currentFiles.filter((f) => !isImageFileName(f.fileName)).length;

    const imageSlots = MAX_IMAGE_FILES - currentImageCount;
    const nonImageSlots = MAX_NON_IMAGE_FILES - currentNonImageCount;

    if (incomingImages.length > imageSlots) {
      toast({
        title: `이미지는 최대 ${MAX_IMAGE_FILES}개까지 첨부할 수 있습니다.`,
        variant: 'error',
      });
    }

    if (incomingNonImages.length > nonImageSlots) {
      toast({
        title: `파일은 최대 ${MAX_NON_IMAGE_FILES}개까지 첨부할 수 있습니다.`,
        variant: 'error',
      });
    }

    const acceptedImages = incomingImages.slice(0, Math.max(0, imageSlots));
    const acceptedNonImages = incomingNonImages.slice(0, Math.max(0, nonImageSlots));
    const toProcess = [...acceptedImages, ...acceptedNonImages];

    if (toProcess.length === 0) return;

    const newFiles = toProcess.map((file) => ({
      id: crypto.randomUUID(),
      file,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      storageKey: '',
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      uploaded: false,
    }));

    addFiles(newFiles);
    uploadToS3(newFiles.map(({ id, file }) => ({ id, file })));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const openImagePicker = () => imageInputRef.current?.click();
  const openFilePicker = () => fileInputRef.current?.click();

  const handleRemoveFile = (id: string | number, fileUrl: string) => {
    // 진행 중인 업로드가 있으면 중단
    const controller = uploadAbortMap.current.get(String(id));
    if (controller) {
      controller.abort();
      uploadAbortMap.current.delete(String(id));
    }
    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    removeFile(id);
  };

  const imageFiles = files.filter((f) => isImageFileName(f.fileName));
  const nonImageFiles = files.filter((f) => !isImageFileName(f.fileName));

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
    handlers: {
      handleInputChange,
    },
  };
}
