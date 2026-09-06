'use client';

import { PENALTY_TYPE_OPTIONS } from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';
import type { PenaltyType } from '@/types/admin/penalty';

interface PenaltyTypeToggleProps {
  value: PenaltyType;
  onValueChange: (value: PenaltyType) => void;
  className?: string;
}

function PenaltyTypeToggle({ value, onValueChange, className }: PenaltyTypeToggleProps) {
  return (
    <div role="radiogroup" aria-label="구분" className={cn('flex items-center', className)}>
      {PENALTY_TYPE_OPTIONS.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'typo-button2 h-12 w-20 shrink-0 cursor-pointer px-200 text-center transition-colors',
              'first:rounded-l-sm last:rounded-r-sm',
              isSelected
                ? 'bg-button-primary text-text-inverse'
                : 'bg-button-neutral text-text-alternative hover:bg-button-neutral-interaction',
              option.disabled && 'text-text-disabled hover:bg-button-neutral cursor-not-allowed',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export { PenaltyTypeToggle, type PenaltyTypeToggleProps };
