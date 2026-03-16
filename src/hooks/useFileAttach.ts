import { useRef, useState, useEffect } from 'react';
import type { FileItem } from '@/stores/usePostStore';

/**
 * 단일 파일 첨부를 관리하는 훅
 *
 * - hidden input ref 제어
 * - blob preview URL 생성 및 해제
 * - 파일 교체 시 기존 blob URL 자동 revoke
 * - 언마운트 시 blob URL 자동 해제
 */
export function useFileAttach() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<FileItem | null>(null);

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
      uploaded: true,
    });
    e.target.value = '';
  };

  const remove = (_id: string, fileUrl: string) => {
    if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
    setFile(null);
  };

  const reset = () => {
    if (file?.fileUrl.startsWith('blob:')) URL.revokeObjectURL(file.fileUrl);
    setFile(null);
  };

  return { inputRef, file, open, handleChange, remove, reset };
}
