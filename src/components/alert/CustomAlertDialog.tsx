'use client';

import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { InfoCircleIcon } from '@/assets/icons';

type Placement = 'above-right' | 'below-right' | 'above-left' | 'below-left';

const PLACEMENT_CLASS: Record<Placement, string> = {
  'above-right': 'bottom-full right-0 mb-200',
  'below-right': 'top-full right-0 mt-200',
  'above-left': 'bottom-full left-0 mb-200',
  'below-left': 'top-full left-0 mt-200',
};

interface CustomAlertDialogProps extends React.ComponentProps<typeof AlertDialogPrimitive.Root> {
  title: string;
  description?: string;
  actionLabel: string;
  cancelLabel?: string;
  onAction: () => void;
  onCancel?: () => void;
  placement?: Placement;
}

function CustomAlertDialog({
  title,
  description,
  actionLabel,
  cancelLabel,
  onAction,
  onCancel,
  placement = 'above-right',
  children,
  ...props
}: CustomAlertDialogProps) {
  return (
    <AlertDialogPrimitive.Root {...props}>
      {children}

      <AlertDialogPrimitive.Content
        className={cn(
          'bg-background border-line data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 absolute z-50 w-[339px] rounded-lg border shadow-[0px_10px_40px_0px_rgba(0,0,0,0.5)] duration-200',
          PLACEMENT_CLASS[placement],
        )}
      >
        {/* Content area */}
        <div className="flex flex-col items-center gap-600 px-400 py-400">
          {/* Icon */}
          <div className="bg-state-error/10 flex items-center rounded-full p-300">
            <Icon src={InfoCircleIcon} size={24} className="text-state-error" />
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-200 text-center">
            <AlertDialogPrimitive.Title className="typo-sub1 text-text-strong whitespace-pre-line">
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
              <button
                type="button"
                onClick={onAction}
                className={cn(
                  'typo-button1 bg-button-neutral text-state-error w-full cursor-pointer rounded-md px-400 py-300 transition-colors',
                  'hover:bg-state-error/10 active:bg-state-error/15',
                )}
              >
                {actionLabel}
              </button>
            </AlertDialogPrimitive.Action>

            {cancelLabel && (
              <AlertDialogPrimitive.Cancel asChild>
                <button
                  type="button"
                  onClick={onCancel}
                  className="typo-button1 text-text-alternative hover:bg-container-neutral-interaction w-full cursor-pointer rounded-md px-400 py-300 transition-colors"
                >
                  {cancelLabel}
                </button>
              </AlertDialogPrimitive.Cancel>
            )}
          </div>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Root>
  );
}

export { CustomAlertDialog, type CustomAlertDialogProps };
