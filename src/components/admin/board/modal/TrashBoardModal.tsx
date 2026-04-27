'use client';

import { Trash2 } from 'lucide-react';

import { Button, Icon } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { InfoCircleIcon } from '@/assets/icons';
import type { TrashedBoard } from '@/types/admin/board';
import { TrashedBoardCard } from './TrashBoardCard';

interface TrashBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boards: TrashedBoard[];
  onRestore?: (boardId: number) => void;
  onPermanentDelete?: (boardId: number) => void;
}

function TrashBoardModal({
  open,
  onOpenChange,
  boards,
  onRestore,
  onPermanentDelete,
}: TrashBoardModalProps) {
  const handleClose = () => onOpenChange(false);
  const isEmpty = boards.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex min-h-165 w-215 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex h-24 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">게시판 휴지통</h2>
          <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="scrollbar-custom tablet:px-[71px] flex max-h-175 min-h-0 flex-1 flex-col gap-400 overflow-y-auto px-700 pt-200 pb-400">
          {/* Notice banner */}
          <div className="bg-container-neutral-alternative flex items-start gap-400 rounded-md p-300">
            <div className="bg-brand-primary/10 flex shrink-0 items-center justify-center rounded-full p-300">
              <Icon src={InfoCircleIcon} size={20} className="text-brand-primary" />
            </div>
            <div className="flex flex-1 flex-col gap-200">
              <p className="typo-sub3 text-brand-primary">보관일 30일</p>
              <p className="typo-body2 text-text-normal whitespace-pre-line">
                {
                  '보관된 게시판은 보관일로부터 30일 후 자동으로 영구 삭제됩니다.\n삭제된 게시판과 게시글은 복구할 수 없으니, 필요한 경우 미리 복구해주세요.'
                }
              </p>
            </div>
          </div>

          {/* List or empty */}
          {isEmpty ? (
            <div className="bg-container-neutral flex min-h-0 flex-1 flex-col items-center justify-center gap-400 rounded-lg">
              <Trash2 aria-hidden className="text-icon-alternative size-16" strokeWidth={1.5} />
              <p className="typo-body2 text-text-alternative">
                최근 30일 간 삭제한 게시판이 없습니다
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-200">
              {boards.map((board) => (
                <TrashedBoardCard
                  key={board.boardId}
                  board={board}
                  onRestore={() => onRestore?.(board.boardId)}
                  onPermanentDelete={() => onPermanentDelete?.(board.boardId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex items-center justify-end gap-200 px-400 pt-400 pb-500">
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={handleClose}>
            완료
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TrashBoardModal, type TrashBoardModalProps };
