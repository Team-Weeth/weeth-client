import { useRef } from 'react';
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from '@/constants/board/file';
import { fileApi } from '@/lib/apis/file';
import type { OwnerType } from '@/lib/apis/file';
import { isImageFile, isImageFileName, isAllowedExtension } from '@/lib/board/fileUtils';
import { toast } from '@/stores/useToastStore';

export interface CoreFileItem {
  id: string;
  file: File;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  uploaded: boolean;
}

interface FileUploadCoreOptions {
  ownerType: OwnerType;
  maxImageFiles: number;
  maxNonImageFiles: number;
  /** 설정 시 이미지·파일 합산 총 개수를 제한 (per-type 제한 대신 사용) */
  maxTotalFiles?: number;
  isAlive: (id: string) => boolean;
  removeFile: (id: string) => void;
  markUploaded: (id: string, storageKey: string, fileUrl: string) => void;
  addFiles: (files: CoreFileItem[]) => void;
  getCurrentFiles: () => { fileName: string }[];
}

/**
 * 파일 업로드 공통 로직 훅
 *
 * S3 presigned URL 업로드, 파일 유효성 검증, 이벤트 핸들러를 제공
 * 상태 관리는 options의 어댑터 콜백(isAlive, removeFile, markUploaded, addFiles)에 위임
 */
export function useFileUploadCore({
  ownerType,
  maxImageFiles,
  maxNonImageFiles,
  maxTotalFiles,
  isAlive,
  removeFile,
  markUploaded,
  addFiles,
  getCurrentFiles,
}: FileUploadCoreOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortMap = useRef<Map<string, AbortController>>(new Map());

  const uploadToS3 = async (filesToUpload: { id: string; file: File }[]) => {
    const alive = filesToUpload.filter(({ id }) => isAlive(id));
    if (alive.length === 0) return;

    let presignedUrls;
    try {
      const { data } = await fileApi.getPresignedUrls(
        ownerType,
        alive.map((f) => f.file.name),
      );
      presignedUrls = data.data;
    } catch {
      toast({ title: '파일 업로드에 실패했습니다.', variant: 'error' });
      alive.forEach(({ id }) => removeFile(id));
      return;
    }

    const remaining = [...presignedUrls];
    const results = await Promise.allSettled(
      alive.map(async ({ id, file }) => {
        if (!isAlive(id)) return;

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

          if (isAlive(id)) {
            markUploaded(id, presigned.storageKey, presigned.putUrl.split('?')[0]);
          }
        } finally {
          uploadAbortMap.current.delete(id);
        }
      }),
    );

    const failedIds = results
      .map((r, i) =>
        r.status === 'rejected' && r.reason?.name !== 'AbortError' ? alive[i].id : null,
      )
      .filter((id): id is string => id !== null && isAlive(id));

    if (failedIds.length > 0) {
      failedIds.forEach((id) => removeFile(id));
      toast({ title: `${failedIds.length}개 파일 업로드에 실패했습니다.`, variant: 'error' });
    }
  };

  const processFiles = (incoming: File[]) => {
    const invalidExt = incoming.filter((f) => !isAllowedExtension(f.name));
    if (invalidExt.length > 0) {
      toast({
        title: `허용되지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')})`,
        variant: 'error',
      });
    }
    const extValid = incoming.filter((f) => isAllowedExtension(f.name));

    const oversized = extValid.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast({
      title: `${oversized.length}개 파일이 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다.`,
      variant: 'error',
    });
    }
    const valid = extValid.filter((f) => f.size <= MAX_FILE_SIZE);

    const currentFiles = getCurrentFiles();
    let toProcess: File[];

    if (maxTotalFiles !== undefined) {
      // 합산 총 개수 제한 모드
      const totalSlots = maxTotalFiles - currentFiles.length;
      if (valid.length > 0 && totalSlots <= 0) {
        toast({
          title: `파일/이미지는 최대 ${maxTotalFiles}개까지 첨부할 수 있습니다.`,
          variant: 'error',
        });
        return;
      }
      if (valid.length > totalSlots) {
        toast({
          title: `파일/이미지는 최대 ${maxTotalFiles}개까지 첨부할 수 있습니다.`,
          variant: 'error',
        });
      }
      toProcess = valid.slice(0, Math.max(0, totalSlots));
    } else {
      // 이미지·파일 각각 개수 제한 모드
      const incomingImages = valid.filter((f) => isImageFile(f));
      const incomingNonImages = valid.filter((f) => !isImageFile(f));

      const imageSlots =
        maxImageFiles - currentFiles.filter((f) => isImageFileName(f.fileName)).length;
      const nonImageSlots =
        maxNonImageFiles - currentFiles.filter((f) => !isImageFileName(f.fileName)).length;

      if (incomingImages.length > imageSlots) {
        toast({
          title: `이미지는 최대 ${maxImageFiles}개까지 첨부할 수 있습니다.`,
          variant: 'error',
        });
      }
      if (incomingNonImages.length > nonImageSlots) {
        toast({
          title: `파일은 최대 ${maxNonImageFiles}개까지 첨부할 수 있습니다.`,
          variant: 'error',
        });
      }

      toProcess = [
        ...incomingImages.slice(0, Math.max(0, imageSlots)),
        ...incomingNonImages.slice(0, Math.max(0, nonImageSlots)),
      ];
    }

    if (toProcess.length === 0) return;

    const newFiles: CoreFileItem[] = toProcess.map((file) => ({
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

  const handleRemoveFile = (id: string | number, fileUrl: string) => {
    const controller = uploadAbortMap.current.get(String(id));
    if (controller) {
      controller.abort();
      uploadAbortMap.current.delete(String(id));
    }
    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    removeFile(String(id));
  };

  return {
    fileInputRef,
    processFiles,
    handleInputChange,
    handleRemoveFile,
  };
}
