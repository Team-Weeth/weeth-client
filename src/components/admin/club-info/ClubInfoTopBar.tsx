'use client';

import type { HTMLAttributes } from 'react';

import { ArrowLeftIcon } from '@/assets/icons';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ClubInfoTopBarProps extends HTMLAttributes<HTMLDivElement> {
  onBack: () => void;
}

function ClubInfoTopBar({ className, onBack, ...props }: ClubInfoTopBarProps) {
  return (
    <div className={cn('bg-container-primary flex h-15 items-center px-500', className)} {...props}>
      <button
        type="button"
        onClick={onBack}
        className="flex shrink-0 cursor-pointer items-center justify-center rounded-sm p-200"
      >
        <Icon src={ArrowLeftIcon} alt="뒤로" size={16} className="text-text-inverse" />
      </button>

      <span className="typo-sub1 text-text-inverse ml-200 shrink-0">수정 모드</span>

      <div className="ml-auto flex gap-200">
        <Button variant="secondary" size="md" className="py-200" onClick={onBack}>
          취소
        </Button>
        <Button variant="secondary" size="md" className="py-200">
          저장
        </Button>
      </div>
    </div>
  );
}

export { ClubInfoTopBar, type ClubInfoTopBarProps };
