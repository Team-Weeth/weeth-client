'use client';

import {
  BoardFormModal,
  type BoardFormData,
} from '@/components/admin/board/modal/BoardFormModal';
import type { Board } from '@/types/admin/board';

type EditBoardFormData = BoardFormData;

interface EditBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
  onSubmit?: (data: EditBoardFormData) => void;
  onDelete?: (board: Board) => void;
}

function EditBoardModal({
  open,
  onOpenChange,
  board,
  onSubmit,
  onDelete,
}: EditBoardModalProps) {
  return (
    <BoardFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="게시판 수정"
      initialValues={
        board
          ? {
              name: board.name,
              description: board.description,
              visibility: board.visibility,
              commentEnabled: board.commentEnabled ?? true,
            }
          : undefined
      }
      onSubmit={onSubmit}
      onDelete={board && onDelete ? () => onDelete(board) : undefined}
    />
  );
}

export { EditBoardModal, type EditBoardModalProps, type EditBoardFormData };
