import { ALLOWED_EXTENSIONS } from '@/constants/board/file';

export const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|bmp|ico|avif)$/i;

export function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

export function isImageFileName(fileName: string): boolean {
  return IMAGE_EXTENSIONS.test(fileName);
}

export function isAllowedExtension(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}
