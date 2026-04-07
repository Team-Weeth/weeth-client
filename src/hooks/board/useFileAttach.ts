import { useRef, useState, useEffect } from 'react';
import { fileApi, type OwnerType } from '@/lib/apis/file';
import type { UploadFileItem } from '@/stores/usePostStore';

/**
 * 단일 파일 첨부를 관리하는 훅
 *
 * - hidden input ref 제어
 * - blob preview URL 생성 및 해제
 * - 파일 교체 시 기존 blob URL 자동 revoke
 * - 언마운트 시 blob URL 자동 해제
 * - upload(): 전송 시점에 presigned URL 요청 → S3 업로드 → storageKey 반환
 */
export function useFileAttach() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<UploadFileItem | null>(null);

  useEffect(() => {
    return () => {
      if (file?.fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(file.fileUrl);
      }
    };
  }, [file]);

  const open = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (file?.fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.fileUrl);
    }
    setFile({
      id: crypto.randomUUID(),
      file: selected,
      fileName: selected.name,
      fileUrl: URL.createObjectURL(selected),
      fileSize: selected.size,
      contentType: selected.type || 'application/octet-stream',
      storageKey: '',
      uploaded: false,
    });
    e.target.value = '';
  };

  const remove = (_id: string | number, fileUrl: string) => {
    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    setFile(null);
  };

  const upload = async (ownerType: OwnerType): Promise<string | null> => {
    if (!file || !file.file) return null;

    const { data } = await fileApi.getPresignedUrls(ownerType, [file.file.name]);
    const presigned = data.data[0];
    if (!presigned) throw new Error('Presigned URL을 받지 못했습니다');

    const res = await fetch(presigned.putUrl, {
      method: 'PUT',
      body: file.file,
      headers: { 'Content-Type': file.file.type },
    });
    if (!res.ok) throw new Error(`파일 업로드 실패 (${res.status})`);

    return presigned.storageKey;
  };

  const reset = () => {
    if (file?.fileUrl.startsWith('blob:')) URL.revokeObjectURL(file.fileUrl);
    setFile(null);
  };

  return { inputRef, file, open, handleChange, remove, reset, upload };
}
