'use client';

import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';

import type { Board } from '@/types/admin/board';
import type { TrashedBoard } from '@/components/admin/board/modal/TrashBoardModal';

const TRASH_RETENTION_DAYS = 30;

interface CreateBoardInput {
  name: string;
  description: string;
  visibility: Board['visibility'];
  commentEnabled: boolean;
}

interface UseBoardPageStateParams {
  initialBoards: Board[];
  initialTrashedBoards: TrashedBoard[];
}

function useBoardPageState({ initialBoards, initialTrashedBoards }: UseBoardPageStateParams) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [trashedBoards, setTrashedBoards] = useState<TrashedBoard[]>(initialTrashedBoards);

  const updateBoard = (boardId: number, patch: Partial<Board>) => {
    setBoards((prev) => prev.map((b) => (b.boardId === boardId ? { ...b, ...patch } : b)));
  };

  const createBoard = (data: CreateBoardInput) => {
    setBoards((prev) => [
      ...prev,
      {
        boardId: Math.max(0, ...prev.map((b) => b.boardId)) + 1,
        name: data.name.trim(),
        description: data.description.trim(),
        kind: 'CUSTOM',
        visibility: data.visibility,
        postCount: 0,
        commentEnabled: data.commentEnabled,
        editable: true,
      },
    ]);
  };

  const moveBoardToTrash = (board: Board) => {
    setBoards((prev) => prev.filter((b) => b.boardId !== board.boardId));
    setTrashedBoards((prev) => [...prev, { ...board, daysLeft: TRASH_RETENTION_DAYS }]);
  };

  const restoreBoardFromTrash = (boardId: number) => {
    const trashed = trashedBoards.find((b) => b.boardId === boardId);
    if (!trashed) return;
    const { daysLeft: _daysLeft, ...board } = trashed;
    setTrashedBoards((prev) => prev.filter((b) => b.boardId !== boardId));
    setBoards((prev) => [...prev, board]);
  };

  const permanentlyDeleteBoard = (boardId: number) => {
    setTrashedBoards((prev) => prev.filter((b) => b.boardId !== boardId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBoards((prev) => {
      const customIds = prev.filter((b) => b.editable).map((b) => b.boardId);
      const oldIndex = customIds.indexOf(Number(active.id));
      const newIndex = customIds.indexOf(Number(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reorderedCustomIds = arrayMove(customIds, oldIndex, newIndex);
      const customById = new Map(
        prev.filter((b) => b.editable).map((b) => [b.boardId, b] as const),
      );

      const result: Board[] = [];
      let cursor = 0;
      for (const board of prev) {
        if (board.editable) {
          const nextId = reorderedCustomIds[cursor++];
          result.push(customById.get(nextId)!);
        } else {
          result.push(board);
        }
      }
      return result;
    });
  };

  return {
    boards,
    trashedBoards,
    updateBoard,
    createBoard,
    moveBoardToTrash,
    restoreBoardFromTrash,
    permanentlyDeleteBoard,
    handleDragEnd,
  };
}

export { useBoardPageState, type CreateBoardInput };
