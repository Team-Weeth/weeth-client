import { Button, Icon } from '@/components/ui';
import type { TrashedBoard } from '@/types/admin/board';
import { PinIcon } from '@/assets/icons';

interface TrashedBoardCardProps {
  board: TrashedBoard;
  onRestore: () => void;
  onPermanentDelete: () => void;
}

export function TrashedBoardCard({ board, onRestore, onPermanentDelete }: TrashedBoardCardProps) {
  return (
    <div className="bg-container-neutral flex min-h-3/4 items-center gap-600 rounded-sm py-400 pr-400 pl-500 shadow-sm">
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
        <Button variant="secondary" size="md" onClick={onRestore}>
          복구
        </Button>
        <Button variant="danger" size="md" onClick={onPermanentDelete}>
          영구 삭제
        </Button>
      </div>
    </div>
  );
}
