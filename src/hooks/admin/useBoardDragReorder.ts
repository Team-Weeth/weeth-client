'use client';

import { useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import type { DragEndEvent } from '@dnd-kit/core';

import { useClubId } from '@/stores';
import { adminBoardQueryKeys } from '@/hooks/queries/admin/boardQueryKeys';
import type { Board, BoardListCache } from '@/types/admin/board';

interface UseBoardDragReorderParams {
  onReorder: (boardIds: number[], options?: { onError?: () => void }) => void;
  /** 드래그 종료 후 실제 PATCH가 나가기까지 대기 시간 (ms) */
  debounceMs?: number;
}

/**
 * 커스텀 게시판 drag-and-drop 재정렬 훅.
 * - 드래그 종료 시 react-query 캐시를 즉시 업데이트(optimistic)
 * - 다음 dragStart까지 debounce되어 마지막 순서만 PATCH로 전송
 */
function useBoardDragReorder({ onReorder, debounceMs = 500 }: UseBoardDragReorderParams) {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const reorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cacheKey = adminBoardQueryKeys.list(clubId);

  const handleDragStart = () => {
    if (reorderTimerRef.current) {
      clearTimeout(reorderTimerRef.current);
      reorderTimerRef.current = null;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const snapshot = queryClient.getQueryData<BoardListCache>(cacheKey);
    if (!snapshot) return;

    const customIds = snapshot.boards.filter((b) => b.editable).map((b) => b.boardId);
    const oldIndex = customIds.indexOf(Number(active.id));
    const newIndex = customIds.indexOf(Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedIds = arrayMove(customIds, oldIndex, newIndex);
    const customById = new Map(
      snapshot.boards.filter((b) => b.editable).map((b) => [b.boardId, b] as const),
    );

    const nextBoards: Board[] = [];
    let cursor = 0;
    for (const board of snapshot.boards) {
      if (board.editable) {
        nextBoards.push(customById.get(reorderedIds[cursor++])!);
      } else {
        nextBoards.push(board);
      }
    }

    queryClient.setQueryData<BoardListCache>(cacheKey, { ...snapshot, boards: nextBoards });

    if (reorderTimerRef.current) {
      clearTimeout(reorderTimerRef.current);
      reorderTimerRef.current = null;
    }
    reorderTimerRef.current = setTimeout(() => {
      reorderTimerRef.current = null;
      onReorder(reorderedIds, {
        onError: () => queryClient.setQueryData(cacheKey, snapshot),
      });
    }, debounceMs);
  };

  return { handleDragStart, handleDragEnd };
}

export { useBoardDragReorder };
