'use client';

import { DeleteIcon } from '@/assets/icons';
import { DialogTitle, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

const TOTAL_STEPS = 2;

interface AddProfileModalHeaderProps {
  step: number;
  title: string;
  onClose: () => void;
}

function AddProfileModalHeader({ step, title, onClose }: AddProfileModalHeaderProps) {
  return (
    <div className="flex items-start justify-between pb-400">
      <div className="flex flex-col gap-400">
        <div className="flex items-center gap-[9px]">
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1 w-[58px] rounded-full',
                step === index + 1 ? 'bg-button-primary' : 'bg-button-neutral',
              )}
            />
          ))}
        </div>
        <DialogTitle className="typo-sub1 text-text-strong">{title}</DialogTitle>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-icon-normal cursor-pointer p-1"
        aria-label="프로필 추가 닫기"
      >
        <Icon src={DeleteIcon} size={24} />
      </button>
    </div>
  );
}

export { AddProfileModalHeader, type AddProfileModalHeaderProps };
