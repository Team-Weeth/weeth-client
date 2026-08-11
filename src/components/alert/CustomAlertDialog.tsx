'use client';

import { useEffect, useRef } from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import InfoCircleIcon from '@/assets/icons/info_circle.svg';

type Placement = 'above-right' | 'below-right' | 'above-left' | 'below-left' | 'center';
type Tone = 'danger' | 'primary';

const PLACEMENT_CLASS: Record<Placement, string> = {
  'above-right': 'absolute bottom-full right-0 mb-200',
  'below-right': 'absolute top-full right-0 mt-200',
  'above-left': 'absolute bottom-full left-0 mb-200',
  'below-left': 'absolute top-full left-0 mt-200',
  center: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

interface ToneStyle {
  iconBg: string;
  iconColor: string;
  button: string;
}

const TONE_STYLES: Record<Tone, ToneStyle> = {
  danger: {
    iconBg: 'bg-state-error/10',
    iconColor: 'text-state-error',
    button:
      'typo-button1 bg-button-neutral text-state-error w-full cursor-pointer rounded-md px-400 py-300 transition-colors hover:bg-state-error/10 active:bg-state-error/15',
  },
  primary: {
    iconBg: 'bg-container-primary-alternative',
    iconColor: 'text-brand-primary',
    button:
      'typo-button1 bg-button-neutral text-text-strong w-full cursor-pointer rounded-md px-400 py-300 transition-colors hover:bg-brand-primary/10',
  },
};

interface CustomAlertDialogProps extends React.ComponentProps<typeof AlertDialogPrimitive.Root> {
  title: string;
  description?: string;
  actionLabel: string;
  cancelLabel?: string;
  onAction: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  secondActionLabel?: string;
  onSecondAction?: () => void;
  placement?: Placement;
  tone?: Tone;
}

function CustomAlertDialog({
  title,
  description,
  actionLabel,
  cancelLabel,
  onAction,
  onCancel,
  onDismiss,
  secondActionLabel,
  onSecondAction,
  placement = 'above-right',
  tone = 'danger',
  children,
  open,
  onOpenChange,
  ...props
}: CustomAlertDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const useOverlay = placement === 'center';
  const toneStyle = TONE_STYLES[tone];

  useEffect(() => {
    if (!open || (!onOpenChange && !onDismiss)) return;
    const handler = (e: PointerEvent) => {
      if (contentRef.current?.contains(e.target as Node)) return;
      onOpenChange?.(false);
      onDismiss?.();
    };
    const timer = setTimeout(() => document.addEventListener('pointerdown', handler), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handler);
    };
  }, [open, onOpenChange, onDismiss]);

  const content = (
    <AlertDialogPrimitive.Content
      ref={contentRef}
      className={cn(
        'bg-background border-line data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-90 w-[339px] rounded-lg border shadow-[0px_10px_40px_0px_rgba(0,0,0,0.5)] duration-200',
        PLACEMENT_CLASS[placement],
      )}
    >
      {/* Content area */}
      <div className="flex flex-col items-center gap-600 px-400 py-400">
        {/* Icon */}
        <div className={cn('flex items-center rounded-full p-300', toneStyle.iconBg)}>
          <Icon src={InfoCircleIcon} size={24} className={toneStyle.iconColor} />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-200 text-center">
          <AlertDialogPrimitive.Title className="typo-sub3 text-text-strong whitespace-pre-line">
            {title}
          </AlertDialogPrimitive.Title>
          {description && (
            <AlertDialogPrimitive.Description className="typo-body2 text-text-alternative whitespace-pre-line">
              {description}
            </AlertDialogPrimitive.Description>
          )}
        </div>
      </div>

      {/* Action area */}
      <div className="flex flex-col gap-200 p-400">
        <div className="border-line border-t" />
        <div className="flex flex-col gap-200">
          <AlertDialogPrimitive.Action asChild>
            <button type="button" onClick={onAction} className={toneStyle.button}>
              {actionLabel}
            </button>
          </AlertDialogPrimitive.Action>

          {secondActionLabel && (
            <AlertDialogPrimitive.Action asChild>
              <button type="button" onClick={onSecondAction} className={toneStyle.button}>
                {secondActionLabel}
              </button>
            </AlertDialogPrimitive.Action>
          )}

          {cancelLabel && (
            <AlertDialogPrimitive.Cancel asChild>
              <button
                type="button"
                onClick={onCancel}
                className="typo-button1 bg-button-neutral text-text-strong hover:bg-container-neutral-interaction w-full cursor-pointer rounded-md px-400 py-300 transition-colors"
              >
                {cancelLabel}
              </button>
            </AlertDialogPrimitive.Cancel>
          )}
        </div>
      </div>
    </AlertDialogPrimitive.Content>
  );

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
      {useOverlay ? (
        <>
          {children}
          <AlertDialogPrimitive.Portal>
            <AlertDialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-90 bg-black/60" />
            {content}
          </AlertDialogPrimitive.Portal>
        </>
      ) : (
        <div className="relative">
          {children}
          {content}
        </div>
      )}
    </AlertDialogPrimitive.Root>
  );
}

export { CustomAlertDialog, type CustomAlertDialogProps };
