'use client';

import { Trash2 } from 'lucide-react';

import { Button, Icon } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { InfoCircleIcon, PinIcon } from '@/assets/icons';

interface TrashedBoard {
  boardId: number;
  name: string;
  description: string;
  /** 영구 삭제까지 남은 일수 (D-N) */
  daysLeft: number;
}

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
        className="bg-background flex h-[880px] max-h-[880px] min-h-[880px] w-215 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex h-24 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">게시판 휴지통</h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기" />
          </button>
        </div>

        {/* Body */}
        <div className="scrollbar-custom tablet:px-[71px] flex min-h-0 flex-1 flex-col gap-400 overflow-y-auto px-700 pt-200 pb-400">
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

interface TrashedBoardCardProps {
  board: TrashedBoard;
  onRestore: () => void;
  onPermanentDelete: () => void;
}

function TrashedBoardCard({ board, onRestore, onPermanentDelete }: TrashedBoardCardProps) {
  return (
    <div className="bg-container-neutral flex items-center gap-600 rounded-sm py-400 pr-400 pl-500 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-400">
        <div className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
          <Icon src={PinIcon} size={24} className="text-icon-normal" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-200">
          <p className="typo-sub1 text-text-strong truncate">{board.name}</p>
          <p className="typo-caption2 text-text-alternative truncate">{board.description}</p>
        </div>
      </div>
      <span className="bg-container-neutral-alternative typo-caption1 text-text-alternative inline-flex w-[71px] shrink-0 items-center justify-center rounded-sm px-200 py-100">
        D-{board.daysLeft}
      </span>
      <div className="bg-line w-px self-stretch" />
      <div className="flex shrink-0 items-center gap-200">
        <Button variant="secondary" size="sm" onClick={onRestore}>
          복구
        </Button>
        <Button variant="danger" size="sm" onClick={onPermanentDelete}>
          영구 삭제
        </Button>
      </div>
    </div>
  );
}

export { TrashBoardModal, type TrashBoardModalProps, type TrashedBoard };
