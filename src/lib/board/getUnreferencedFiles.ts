import type { FileItem } from '@/types/file';

/**
 * 게시글 HTML 내에서 참조되지 않은 파일만 반환 (하위 호환용)
 *
 * 새 게시글: 모든 파일이 HTML에 인라인 → 빈 배열 반환
 * 기존 게시글: HTML에 참조 없음 → 전체 배열 반환
 *
 * URL 인코딩 차이 허용: presigned URL 기반 경로는 공백을 %20으로 인코딩하지만
 * API가 반환하는 fileUrl은 리터럴 공백을 포함할 수 있어, 양방향을 모두 검사한다.
 */
export function getUnreferencedFiles(htmlContent: string, files: FileItem[]): FileItem[] {
  return files.filter((f) => {
    if (htmlContent.includes(f.fileUrl)) return false;
    if (htmlContent.includes(f.fileUrl.replace(/ /g, '%20'))) return false;
    if (htmlContent.includes(f.fileUrl.replace(/%20/gi, ' '))) return false;
    return true;
  });
}
