import type { FileItem, DisplayFile } from '@/types/file';

/**
 * 게시글 목록용 이미지 목록 생성.
 * content HTML에서 img[src]를 추출해 정확한 개수를 반영한다.
 * (같은 이미지를 여러 번 삽입한 경우에도 모두 표시)
 * content에 이미지가 없으면 fileUrls에서 추출한다.
 */
export function toDisplayImages(files: FileItem[], content: string): DisplayFile[] {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  const inlineImages = Array.from(doc.querySelectorAll('img'))
    .map((img, i) => ({
      id: `inline-${i}`,
      fileName: '',
      fileUrl: img.getAttribute('src') ?? '',
    }))
    .filter((item) => item.fileUrl !== '');

  if (inlineImages.length > 0) return inlineImages;

  return files
    .filter((f) => f.contentType.startsWith('image/'))
    .map((f) => ({ id: f.fileId, fileName: f.fileName, fileUrl: f.fileUrl, uploaded: true }));
}
