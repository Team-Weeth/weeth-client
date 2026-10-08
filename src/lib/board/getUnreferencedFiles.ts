import type { FileItem } from '@/types/file';

/**
 * HTML 내에 fileUrl이 인라인 노드의 src 또는 data-src 속성으로 참조되어 있는지 확인.
 * - URL 인코딩 차이 허용 (공백 ↔ %20, 기타 퍼센트 인코딩)
 * - HTML 속성 엔티티 허용 (& ↔ &amp;)
 * - 본문 텍스트에 URL이 등장하는 경우는 참조로 판정하지 않음
 */
export function isReferencedInContent(fileUrl: string, htmlContent: string): boolean {
  const checkUrl = (url: string): boolean => {
    const variants = [url, url.replace(/ /g, '%20'), url.replace(/%20/gi, ' ')];
    return variants.some((v) => {
      const encoded = v.replace(/&/g, '&amp;');
      return (
        htmlContent.includes(`src="${v}"`) ||
        htmlContent.includes(`src="${encoded}"`) ||
        htmlContent.includes(`data-src="${v}"`) ||
        htmlContent.includes(`data-src="${encoded}"`)
      );
    });
  };

  if (checkUrl(fileUrl)) return true;

  // presigned GET URL처럼 쿼리 파라미터가 포함된 경우 base URL로도 재확인
  const baseFileUrl = fileUrl.includes('?') ? fileUrl.split('?')[0] : fileUrl;
  if (baseFileUrl !== fileUrl && checkUrl(baseFileUrl)) return true;

  // decodeURIComponent 정규화 후 HTML의 src/data-src 값과 비교
  // (S3 SDK마다 다를 수 있는 퍼센트 인코딩 차이, 예: %28 ↔ ( 등 허용)
  let decodedFileUrl: string;
  try {
    decodedFileUrl = decodeURIComponent(baseFileUrl);
  } catch {
    // 잘못된 퍼센트 인코딩이더라도 regex 루프는 계속 시도
    decodedFileUrl = baseFileUrl;
  }

  const attrPattern = /(?:src|data-src)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = attrPattern.exec(htmlContent)) !== null) {
    const rawAttr = m[1].replace(/&amp;/g, '&');
    const baseRawAttr = rawAttr.includes('?') ? rawAttr.split('?')[0] : rawAttr;
    let decodedAttr: string;
    try {
      decodedAttr = decodeURIComponent(baseRawAttr);
    } catch {
      decodedAttr = baseRawAttr;
    }
    if (decodedAttr === decodedFileUrl) return true;
  }

  return false;
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
