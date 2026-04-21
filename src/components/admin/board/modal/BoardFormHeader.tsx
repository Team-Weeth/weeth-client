'use client';

import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { DiscardConfirmDialog, type DiscardMessages } from '@/components/admin/modal/DiscardConfirmDialog';
import { CustomAlertDialog } from '@/components/alert';
import { DeleteBoardDialog } from '@/components/admin/board/modal/DeleteBoardDialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { AdminCloseIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import type { DiscardSource } from '@/hooks/useDiscardableForm';

interface BoardFormHeaderProps {
  title: string;
  boardName: string;
  hasChanges: boolean;
  discardSource: DiscardSource;
  discardMessages: DiscardMessages;
  onTryClose: () => void;
  onDiscardConfirm: () => void;
  onDismissDiscard: () => void;
  onDelete?: () => void;
}

function BoardFormHeader({
  title,
  boardName,
  hasChanges,
  discardSource,
  discardMessages,
  onTryClose,
  onDiscardConfirm,
  onDismissDiscard,
  onDelete,
}: BoardFormHeaderProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteDiscardOpen, setDeleteDiscardOpen] = useState(false);

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
                <DropdownMenuItem
                  destructive
                  onSelect={() => {
                    requestAnimationFrame(() => {
                      if (hasChanges) {
                        setDeleteDiscardOpen(true);
                      } else {
                        setDeleteOpen(true);
                      }
                    });
                  }}
                >
                  게시판 삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CustomAlertDialog
              open={deleteDiscardOpen}
              onOpenChange={setDeleteDiscardOpen}
              title={discardMessages.title}
              actionLabel={discardMessages.actionLabel}
              cancelLabel={discardMessages.cancelLabel}
              onAction={() => {
                setDeleteDiscardOpen(false);
                onDelete();
              }}
              onDismiss={() => setDeleteDiscardOpen(false)}
              placement="below-right"
            />
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
        <div className="relative">
          <ModalIconButton
            icon={AdminCloseIcon}
            label="닫기"
            onClick={onTryClose}
          />
          <DiscardConfirmDialog
            source="close"
            currentSource={discardSource}
            messages={discardMessages}
            onConfirm={onDiscardConfirm}
            onDismiss={onDismissDiscard}
            placement="below-right"
          />
        </div>
      </div>
    </div>
  );
}

export { BoardFormHeader, type BoardFormHeaderProps };
