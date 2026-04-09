import { fileApi } from '@/lib/apis/file';
import type { OwnerType } from '@/lib/apis/file';

export interface UploadedFile {
  fileName: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
}

export async function uploadFile(file: File, ownerType: OwnerType): Promise<UploadedFile> {
  const res = await fileApi.getPresignedUrls(ownerType, [file.name]);
  const presigned = res.data.data[0];
  if (!presigned) throw new Error('Presigned URL을 받지 못했습니다.');

  const uploadRes = await fetch(presigned.putUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!uploadRes.ok) throw new Error('파일 업로드에 실패했습니다.');

  return {
    fileName: file.name,
    storageKey: presigned.storageKey,
    fileSize: file.size,
    contentType: file.type,
  };
}
