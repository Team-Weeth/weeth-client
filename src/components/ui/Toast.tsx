'use client';

import * as React from 'react';
import { Toast as ToastPrimitive } from 'radix-ui';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import type { ToastVariant } from '@/stores/useToastStore';
import CheckRoundIcon from '@/assets/icons/check_round.svg';
import DeleteRoundIcon from '@/assets/icons/delete_round.svg';
import CautionIcon from '@/assets/icons/caution.svg';

const toastVariants = cva(
  'pointer-events-auto flex min-w-[324px] items-center gap-200 rounded-lg bg-container-floating p-400 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full',
);

const iconMap: Record<
  ToastVariant,
  { src: React.ComponentProps<typeof Icon>['src']; className: string }
> = {
  success: { src: CheckRoundIcon, className: 'text-brand-primary' },
  warning: { src: CautionIcon, className: 'text-state-caution' },
  error: { src: DeleteRoundIcon, className: 'text-state-error' },
};

function ToastProvider({ ...props }: React.ComponentProps<typeof ToastPrimitive.Provider>) {
  return <ToastPrimitive.Provider swipeDirection="down" {...props} />;
}

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      aria-live="polite"
      className={cn(
        'fixed bottom-0 left-0 z-[9999] flex w-full flex-col items-center gap-200 pb-[40px]',
        className,
      )}
      {...props}
    />
  );
}

interface ToastProps extends React.ComponentProps<typeof ToastPrimitive.Root> {
  variant?: ToastVariant;
}

function Toast({ className, variant = 'success', children, ...props }: ToastProps) {
  const icon = iconMap[variant];

  return (
    <ToastPrimitive.Root data-slot="toast" className={cn(toastVariants(), className)} {...props}>
      <Icon src={icon.src} size={20} className={icon.className} />
      <ToastPrimitive.Title className="typo-sub3 text-text-on-floating text-center">
        {children}
      </ToastPrimitive.Title>
    </ToastPrimitive.Root>
  );
}

export { ToastProvider, ToastViewport, Toast, toastVariants, type ToastProps };
