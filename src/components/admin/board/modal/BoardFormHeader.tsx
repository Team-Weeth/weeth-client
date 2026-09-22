'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  DiscardConfirmDialog,
  type DiscardMessages,
} from '@/components/admin/modal/DiscardConfirmDialog';
import { DeleteBoardDialog } from '@/components/admin/board/modal/DeleteBoardDialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import AdminMeatballIcon from '@/assets/icons/admin/ic_admin_meatball.svg';
import type { DiscardSource } from '@/hooks/useDiscardableForm';

interface BoardFormHeaderProps {
  title: string;
  boardName: string;
  discardSource: DiscardSource;
  setDiscardSource: Dispatch<SetStateAction<DiscardSource>>;
  discardMessages: DiscardMessages;
  onTryClose: () => void;
  onDiscardConfirm: () => void;
  onDelete?: () => void;
}

function BoardFormHeader({
  title,
  boardName,
  discardSource,
  setDiscardSource,
  discardMessages,
  onTryClose,
  onDiscardConfirm,
  onDelete,
}: BoardFormHeaderProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const dismissDiscard = () => setDiscardSource(null);

  // DropdownMenuItem onSelect이 드롭다운을 즉시 닫으면서 AlertDialog 오픈과 포커스가 충돌하므로 한 프레임 늦춤
  const handleDeleteSelect = () => {
    requestAnimationFrame(() => setDeleteOpen(true));
  };

  return (
    <div className="flex h-24 items-center justify-between px-600">
      <h2 className="typo-h3 text-text-normal">{title}</h2>
      <div className="flex items-center gap-200">
        {onDelete && (
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ModalIconButton icon={AdminMeatballIcon} label="더보기" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem destructive onSelect={handleDeleteSelect}>
                  게시판 삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DeleteBoardDialog
              name={boardName}
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              onConfirm={() => {
                setDeleteOpen(false);
                onDelete();
              }}
            />
          </div>
        )}
        <DiscardConfirmDialog
          source="close"
          currentSource={discardSource}
          messages={discardMessages}
          onConfirm={onDiscardConfirm}
          onDismiss={dismissDiscard}
          placement="below-right"
        >
          <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={onTryClose} />
        </DiscardConfirmDialog>
      </div>
    </div>
  );
}

export { BoardFormHeader, type BoardFormHeaderProps };
