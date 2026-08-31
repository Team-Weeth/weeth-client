'use client';

import type { StaticImageData } from 'next/image';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface ModalIconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> {
  icon: StaticImageData;
  size?: number;
  label: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function ModalIconButton({
  icon,
  size = 24,
  label,
  className,
  type = 'button',
  ref,
  ...props
}: ModalIconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn('flex cursor-pointer items-center justify-center rounded-sm p-200', className)}
      {...props}
    >
      <Icon src={icon} size={size} alt={label} />
    </button>
  );
}

export { ModalIconButton, type ModalIconButtonProps };
