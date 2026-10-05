import type { FileItem } from '@/types/file';

/**
 * HTML 내에 fileUrl이 인라인 노드의 src 또는 data-src 속성으로 참조되어 있는지 확인.
 * - URL 인코딩 차이 허용 (공백 ↔ %20)
 * - HTML 속성 엔티티 허용 (& ↔ &amp;)
 * - 본문 텍스트에 URL이 등장하는 경우는 참조로 판정하지 않음
 */
export function isReferencedInContent(fileUrl: string, htmlContent: string): boolean {
  const variants = [fileUrl, fileUrl.replace(/ /g, '%20'), fileUrl.replace(/%20/gi, ' ')];

  const checkAttr = (url: string) => {
    const encoded = url.replace(/&/g, '&amp;');
    return (
      htmlContent.includes(`src="${url}"`) ||
      htmlContent.includes(`src="${encoded}"`) ||
      htmlContent.includes(`data-src="${url}"`) ||
      htmlContent.includes(`data-src="${encoded}"`)
    );
  };

  return variants.some(checkAttr);
}

/**
 * 게시글 HTML 내에서 참조되지 않은 파일만 반환 (하위 호환용)
 *
 * 새 게시글: 모든 파일이 HTML에 인라인 → 빈 배열 반환
 * 기존 게시글: HTML에 참조 없음 → 전체 배열 반환
 */
export function getUnreferencedFiles(htmlContent: string, files: FileItem[]): FileItem[] {
  return files.filter((f) => !isReferencedInContent(f.fileUrl, htmlContent));
}
