'use client';

import * as React from 'react';
import Image from 'next/image';
import { Toast as ToastPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';
import CheckRoundIcon from '@/assets/icons/check_round.svg';
import InfoCircleIcon from '@/assets/icons/info_circle.svg';
import CautionIcon from '@/assets/icons/caution.svg';

const toastVariants = cva(
  'pointer-events-auto flex h-[40px] max-w-[90%] items-center justify-center gap-200 rounded-full px-400 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full',
  {
    variants: {
      variant: {
        success: 'bg-state-success text-white',
        info: 'bg-state-caution text-text-inverse',
        error: 'bg-state-error text-text-inverse',
      },
    },
    defaultVariants: {
      variant: 'success',
    },
  },
);

const iconMap = {
  success: { src: CheckRoundIcon, className: 'invert brightness-0' },
  info: { src: InfoCircleIcon, className: 'invert brightness-0' },
  error: { src: CautionIcon, className: 'invert brightness-0' },
} as const;

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

interface ToastProps
  extends React.ComponentProps<typeof ToastPrimitive.Root>, VariantProps<typeof toastVariants> {}

function Toast({ className, variant = 'success', children, ...props }: ToastProps) {
  const icon = iconMap[variant!];

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <Image
        src={icon.src}
        alt=""
        width={20}
        height={20}
        aria-hidden="true"
        className={icon.className}
      />
      <ToastPrimitive.Title className="typo-caption1 text-center">{children}</ToastPrimitive.Title>
    </ToastPrimitive.Root>
  );
}

export { ToastProvider, ToastViewport, Toast, toastVariants, type ToastProps };
