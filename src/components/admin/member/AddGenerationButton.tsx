'use client';

import { AdminPlusIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface AddGenerationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}

function AddGenerationButton({ className, ref, ...props }: AddGenerationButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(
        'bg-container-neutral flex h-[164px] w-[80px] shrink-0 cursor-pointer items-center justify-center rounded-lg shadow-sm',
        className,
      )}
      {...props}
    >
      <Icon src={AdminPlusIcon} alt="기수 추가" size={24} />
    </button>
  );
}

export { AddGenerationButton, type AddGenerationButtonProps };
