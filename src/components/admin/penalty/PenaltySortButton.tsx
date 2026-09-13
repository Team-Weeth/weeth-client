'use client';

import { ConvertIcon } from '@/assets/icons';
import { Icon } from '@/components/ui/Icon';
import { PENALTY_SORT_LABEL } from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';
import type { PenaltySortBy } from '@/types/admin/penalty';

interface PenaltySortButtonProps {
  sortBy: PenaltySortBy;
  nextSortBy: PenaltySortBy;
  onToggleSort: () => void;
  /** 고를 수 있는 정렬 기준이 하나뿐이면 비활성화한다 */
  disabled?: boolean;
}

function PenaltySortButton({ sortBy, nextSortBy, onToggleSort, disabled }: PenaltySortButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggleSort}
      disabled={disabled}
      aria-label={`${PENALTY_SORT_LABEL[nextSortBy]}으로 정렬`}
      className={cn(
        'typo-sub1 text-text-alternative hover:text-text-strong flex h-9 cursor-pointer items-center justify-center gap-[6px] rounded-sm px-2.5 transition-colors',
        disabled && 'hover:text-text-alternative cursor-default',
      )}
    >
      <Icon src={ConvertIcon} size={20} />
      {PENALTY_SORT_LABEL[sortBy]}
    </button>
  );
}

export { PenaltySortButton, type PenaltySortButtonProps };
