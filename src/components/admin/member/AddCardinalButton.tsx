'use client';

import { AdminPlusIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface AddCardinalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
}

function AddCardinalButton({
  className,
  ref,
  type = 'button',
  ...props
}: AddCardinalButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'bg-button-neutral border-line flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border',
        className,
      )}
      {...props}
    >
      <Icon src={AdminPlusIcon} alt="기수 추가" size={24} />
    </button>
  );
}

export { AddCardinalButton, type AddCardinalButtonProps };
