'use client';

import { ChevronRightIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { BottomSheetActionItemProps } from './bottom-sheet.types';

function BottomSheetActionItem({
  children,
  destructive = false,
  disabled = false,
  className,
  ...props
}: BottomSheetActionItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'typo-sub1 flex w-full cursor-pointer items-center justify-between rounded-sm py-[14px] text-left disabled:cursor-not-allowed disabled:opacity-40',
        destructive ? 'text-state-error' : 'text-text-normal',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronRightIcon
        aria-hidden
        strokeWidth={2}
        className="text-icon-alternative size-5 shrink-0"
      />
    </button>
  );
}

export { BottomSheetActionItem };
