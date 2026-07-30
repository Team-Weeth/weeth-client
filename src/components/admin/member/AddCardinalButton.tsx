'use client';

import { AdminPlusIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface AddCardinalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}

function AddCardinalButton({ className, ref, type = 'button', ...props }: AddCardinalButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'text-icon-normal hover:text-icon-strong flex h-14 w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors hover:bg-neutral-200',
        className,
      )}
      {...props}
    >
      <Icon src={AdminPlusIcon} alt="기수 추가" size={24} />
    </button>
  );
}

export { AddCardinalButton, type AddCardinalButtonProps };
