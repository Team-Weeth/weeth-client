import type { FileItem } from '@/types/file';

/**
 * 게시글 HTML 내에서 참조되지 않은 파일만 반환 (하위 호환용)
 *
 * 새 게시글: 모든 파일이 HTML에 인라인 → 빈 배열 반환
 * 기존 게시글: HTML에 참조 없음 → 전체 배열 반환
 */
export function getUnreferencedFiles(htmlContent: string, files: FileItem[]): FileItem[] {
  return files.filter((f) => !htmlContent.includes(f.fileUrl));
}
