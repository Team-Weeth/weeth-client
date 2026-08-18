'use client';

import { ConvertIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { PENALTY_SORT_LABEL } from '@/constants/admin/penaltyTable.constants';
import type { PenaltySortBy } from '@/types/admin/penalty';

interface PenaltySortButtonProps {
  sortBy: PenaltySortBy;
  nextSortBy: PenaltySortBy;
  onToggleSort: () => void;
}

function PenaltySortButton({ sortBy, nextSortBy, onToggleSort }: PenaltySortButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggleSort}
      aria-label={`${PENALTY_SORT_LABEL[nextSortBy]}으로 정렬`}
      className="typo-sub1 text-text-alternative hover:text-text-strong flex h-9 cursor-pointer items-center justify-center gap-[6px] rounded-sm px-[2.5] transition-colors"
    >
      <Icon src={ConvertIcon} size={20} />
      {PENALTY_SORT_LABEL[sortBy]}
    </button>
  );
}

export { PenaltySortButton, type PenaltySortButtonProps };
