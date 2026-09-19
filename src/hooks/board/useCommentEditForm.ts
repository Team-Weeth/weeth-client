import { useState } from 'react';
import { toCreatePostFile } from '@/lib/board';
import type { DisplayFile } from '@/types/board';
import type { CreatePostFile } from '@/types/file';

/**
 * 댓글/답글 수정 폼의 기존 파일 관리 로직
 *
 * - 기존 첨부파일 중 삭제된 항목 추적
 * - 편집 중인 파일 목록 파생
 * - 수정 요청 시 보낼 파일 목록 계산
 */
export function useCommentEditForm(
  imageFileUrls: DisplayFile[] | undefined,
  nonImageFileUrls: DisplayFile[] | undefined,
) {
  const [removedExistingIds, setRemovedExistingIds] = useState<Set<string | number>>(new Set());

  const editingImageFiles = (imageFileUrls ?? []).filter((f) => !removedExistingIds.has(f.id));
  const editingNonImageFiles = (nonImageFileUrls ?? []).filter(
    (f) => !removedExistingIds.has(f.id),
  );

  const handleRemoveExistingFile = (fileId: string | number) => {
    setRemovedExistingIds((prev) => new Set([...prev, fileId]));
  };

  const resetRemovedIds = () => setRemovedExistingIds(new Set());

  // 변경 사항이 없으면 null(기존 유지), 있으면 서버에 보낼 전체 파일 목록 반환
  const buildFilesToSend = (newFiles: CreatePostFile[]): CreatePostFile[] | null => {
    if (removedExistingIds.size === 0 && newFiles.length === 0) return null;
    const remainingExisting = [...editingImageFiles, ...editingNonImageFiles]
      .map(toCreatePostFile)
      .filter((f): f is CreatePostFile => f !== null);
    return [...remainingExisting, ...newFiles];
  };

  return {
    editingImageFiles,
    editingNonImageFiles,
    handleRemoveExistingFile,
    resetRemovedIds,
    buildFilesToSend,
  };
}
