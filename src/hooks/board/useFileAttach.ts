// 단일 파일 첨부 기능

// import { useRef, useState, useEffect } from 'react';
// import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '@/constants/board/file';
// import { fileApi, type OwnerType } from '@/lib/apis/file';
// import type { UploadFileItem } from '@/stores/usePostStore';
// import { toast } from '@/stores/useToastStore';

// function getExtension(fileName: string): string {
//   return fileName.split('.').pop()?.toLowerCase() ?? '';
// }

// function isAllowedExtension(fileName: string): boolean {
//   const ext = getExtension(fileName);
//   return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
// }

// export function useFileAttach() {
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [file, setFile] = useState<UploadFileItem | null>(null);

//   useEffect(() => {
//     return () => {
//       if (file?.fileUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(file.fileUrl);
//       }
//     };
//   }, [file]);

//   const open = () => inputRef.current?.click();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selected = e.target.files?.[0];
//     if (!selected) return;

//     if (!isAllowedExtension(selected.name)) {
//       toast({
//         title: `허용되지 않는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(', ')})`,
//         variant: 'error',
//       });
//       e.target.value = '';
//       return;
//     }

//     if (selected.size > MAX_FILE_SIZE) {
//       toast({ title: '파일 크기가 10MB를 초과합니다.', variant: 'error' });
//       e.target.value = '';
//       return;
//     }

//     if (file?.fileUrl.startsWith('blob:')) {
//       URL.revokeObjectURL(file.fileUrl);
//     }
//     setFile({
//       id: crypto.randomUUID(),
//       file: selected,
//       fileName: selected.name,
//       fileUrl: URL.createObjectURL(selected),
//       fileSize: selected.size,
//       contentType: selected.type || 'application/octet-stream',
//       storageKey: '',
//       uploaded: false,
//     });
//     e.target.value = '';
//   };

//   const remove = (_id: string | number, fileUrl: string) => {
//     if (fileUrl.startsWith('blob:')) URL.revokeObjectURL(fileUrl);
//     setFile(null);
//   };

//   const upload = async (ownerType: OwnerType): Promise<string | null> => {
//     if (!file || !file.file) return null;

//     try {
//       const { data } = await fileApi.getPresignedUrls(ownerType, [file.file.name]);
//       const presigned = data.data[0];
//       if (!presigned) throw new Error('Presigned URL을 받지 못했습니다');

//       const res = await fetch(presigned.putUrl, {
//         method: 'PUT',
//         body: file.file,
//         headers: { 'Content-Type': file.file.type },
//       });
//       if (!res.ok) throw new Error(`파일 업로드 실패 (${res.status})`);

//       return presigned.storageKey;
//     } catch {
//       toast({ title: '파일 업로드에 실패했습니다.', variant: 'error' });
//       return null;
//     }
//   };

//   const reset = () => {
//     if (file?.fileUrl.startsWith('blob:')) URL.revokeObjectURL(file.fileUrl);
//     setFile(null);
//   };

//   return { inputRef, file, open, handleChange, remove, reset, upload };
// }
