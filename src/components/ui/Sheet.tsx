'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { AdminScopeBoundary } from '@/providers';

const ANIMATION_CLASSES =
  'duration-300 ease-[cubic-bezier(0.15,0.89,1,1)] data-[state=open]:animate-in data-[state=closed]:animate-out';

function Sheet(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ children, ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return (
    <DialogPrimitive.Portal data-slot="sheet-portal" {...props}>
      <AdminScopeBoundary>{children}</AdminScopeBoundary>
    </DialogPrimitive.Portal>
  );
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-[60] bg-black/60',
        ANIMATION_CLASSES,
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

const sheetContentVariants = cva(
  cn(
    'fixed top-0 bottom-0 z-[60] flex h-screen flex-col bg-container-neutral shadow-lg outline-none',
    ANIMATION_CLASSES,
  ),
  {
    variants: {
      side: {
        left: 'left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right:
          'right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
    },
    defaultVariants: { side: 'left' },
  },
);

interface SheetContentProps
  extends
    React.ComponentProps<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {
  overlayClassName?: string;
}

function SheetContent({
  className,
  overlayClassName,
  side,
  children,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        aria-describedby={undefined}
        className={cn(sheetContentVariants({ side }), className)}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">메뉴</DialogPrimitive.Title>
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  sheetContentVariants,
  type SheetContentProps,
};
