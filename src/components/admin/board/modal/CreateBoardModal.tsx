'use client';

import { BoardFormModal, type BoardFormData } from '@/components/admin/board/modal/BoardFormModal';

type CreateBoardFormData = BoardFormData;

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: CreateBoardFormData) => void;
  nameError?: string | null;
  onNameChange?: () => void;
}

function CreateBoardModal({
  open,
  onOpenChange,
  onSubmit,
  nameError,
  onNameChange,
}: CreateBoardModalProps) {
  return (
    <BoardFormModal
      open={open}
      onOpenChange={onOpenChange}
      title="게시판 생성"
      mode="create"
      onSubmit={onSubmit}
      nameError={nameError}
      onNameChange={onNameChange}
    />
  );
}

export { CreateBoardModal, type CreateBoardModalProps, type CreateBoardFormData };
