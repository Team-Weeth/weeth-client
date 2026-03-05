'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { StaticImageData } from 'next/image';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import deleteIcon from '@/assets/icons/delete.svg';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'bg-container-neutral data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-78.75 max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-400 shadow-lg duration-200 outline-none sm:max-w-lg',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
          >
            <span
              aria-hidden
              className="block h-6 w-6 shrink-0 bg-neutral-800"
              style={{
                maskImage: `url(${(deleteIcon as StaticImageData).src})`,
                WebkitMaskImage: `url(${(deleteIcon as StaticImageData).src})`,
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'contain',
              }}
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  overline?: string;
  title?: string;
  description?: string;
  showClose?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

function DialogHeader({
  overline,
  title,
  description,
  showClose = false,
  onClose,
  children,
  className,
  ...props
}: DialogHeaderProps) {
  // If children provided, use custom content mode
  if (children) {
    return (
      <div
        data-slot="dialog-header"
        className={cn('flex items-center justify-between p-400', className)}
        {...props}
      >
        <DialogPrimitive.Title asChild>
          <div className="flex items-center gap-300">{children}</div>
        </DialogPrimitive.Title>
        {showClose && onClose && (
          <span
            aria-hidden
            onClick={onClose}
            className="block h-6 w-6 shrink-0 cursor-pointer bg-neutral-800"
            style={{
              maskImage: `url(${(deleteIcon as StaticImageData).src})`,
              WebkitMaskImage: `url(${(deleteIcon as StaticImageData).src})`,
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              maskSize: 'contain',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      data-slot="dialog-header"
      className={cn('flex items-start justify-between p-400', className)}
      {...props}
    >
      <div className="flex flex-col">
        {overline && <p className="typo-caption1 text-text-alternative mb-200">{overline}</p>}
        {title ? (
          <DialogPrimitive.Title asChild>
            <h2 className="typo-sub1 text-text-strong mb-200">{title}</h2>
          </DialogPrimitive.Title>
        ) : (
          <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
        )}
        {description && <p className="typo-body2 text-text-alternative">{description}</p>}
      </div>
      {showClose && onClose && (
        <span
          aria-hidden
          onClick={onClose}
          className="block h-6 w-6 shrink-0 cursor-pointer bg-neutral-800"
          style={{
            maskImage: `url(${(deleteIcon as StaticImageData).src})`,
            WebkitMaskImage: `url(${(deleteIcon as StaticImageData).src})`,
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
        />
      )}
    </div>
  );
}

function DialogBody({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('scrollbar-custom flex flex-col gap-300 overflow-y-auto p-400', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  description?: string;
  pagination?: React.ReactNode;
  showDivider?: boolean;
  showCloseButton?: boolean;
}

function DialogFooter({
  children,
  description,
  pagination,
  showDivider = true,
  showCloseButton = false,
  className,
  ...props
}: DialogFooterProps) {
  return (
    <div data-slot="dialog-footer" className={cn('flex flex-col', className)} {...props}>
      {showDivider && <Divider />}
      <div className="flex flex-col gap-[10px] p-400">
        {children}
        {pagination
          ? pagination
          : description && (
              <p className="typo-caption2 text-text-alternative mt-200 text-center">
                {description}
              </p>
            )}
        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <Button variant="secondary">Close</Button>
          </DialogPrimitive.Close>
        )}
      </div>
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
export type { DialogHeaderProps, DialogFooterProps };
