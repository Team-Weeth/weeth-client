'use client';

import Image from 'next/image';

import { AdminPlusIcon } from '@/assets/icons';
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
      <Image src={AdminPlusIcon} alt="기수 추가" width={24} height={24} />
    </button>
  );
}

export { AddGenerationButton, type AddGenerationButtonProps };
