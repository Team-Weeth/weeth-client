'use client';

import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import { Button, type ButtonProps } from '@/components/ui/Button';

import InfoIcon from '@/assets/icons/info.svg';
import DeleteIcon from '@/assets/icons/delete_forever.svg';

type AlertStatus = 'default' | 'danger';

const AlertDialogContext = React.createContext<{ status: AlertStatus }>({
  status: 'default',
});

interface AlertDialogProps extends React.ComponentProps<typeof AlertDialogPrimitive.Root> {
  status?: AlertStatus;
}

function AlertDialog({ status = 'default', ...props }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ status }}>
      <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-81.25 max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-300 rounded-lg p-500 duration-200 sm:max-w-xs',
          className,
        )}
        style={{ boxShadow: 'var(--shadow-dialog)' }}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const { status } = React.useContext(AlertDialogContext);
  const Icon = status === 'danger' ? DeleteIcon : InfoIcon;

  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col items-center gap-400', className)}
      {...props}
    >
      <Image src={Icon} alt="" width={48} height={48} />
      <div className="flex flex-col items-center gap-200 text-center">{props.children}</div>
    </div>
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('border-line flex flex-col gap-200 border-t pt-200', className)}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('typo-sub1 text-text-strong', className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('typo-body2 text-text-alternative', className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  variant,
  size = 'lg',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<ButtonProps, 'variant' | 'size'>) {
  const { status } = React.useContext(AlertDialogContext);
  const defaultVariant = variant || (status === 'danger' ? 'danger' : 'primary');

  return (
    <AlertDialogPrimitive.Action asChild data-slot="alert-dialog-action">
      <Button variant={defaultVariant} size={size} className={cn('w-full', className)} {...props} />
    </AlertDialogPrimitive.Action>
  );
}

function AlertDialogCancel({
  className,
  variant = 'secondary',
  size = 'lg',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<ButtonProps, 'variant' | 'size'>) {
  return (
    <AlertDialogPrimitive.Cancel asChild data-slot="alert-dialog-cancel">
      <Button variant={variant} size={size} className={cn('w-full', className)} {...props} />
    </AlertDialogPrimitive.Cancel>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
