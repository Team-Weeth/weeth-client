'use client';

import * as React from 'react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';
import { AdminScopeBoundary } from '@/providers';

type DropdownMenuType = 'default' | 'position';
const DropdownMenuTypeContext = React.createContext<DropdownMenuType>('default');

function DropdownMenu({
  modal = false,
  type = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root> & { type?: DropdownMenuType }) {
  return (
    <DropdownMenuTypeContext value={type}>
      <DropdownMenuPrimitive.Root data-slot="dropdown-menu" modal={modal} {...props} />
    </DropdownMenuTypeContext>
  );
}

function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  const type = React.useContext(DropdownMenuTypeContext);
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        type === 'position' &&
          'border-line bg-container-neutral text-icon-normal focus-visible:outline-brand-primary flex h-12 w-[78px] shrink-0 items-center justify-center gap-200 rounded-sm border py-300 pr-300 pl-400 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuPortal({
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props}>
      <AdminScopeBoundary>{children}</AdminScopeBoundary>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  onTouchMove,
  onWheel,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const type = React.useContext(DropdownMenuTypeContext);
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        onTouchMove={(event) => {
          event.stopPropagation();
          onTouchMove?.(event);
        }}
        onWheel={(event) => {
          event.stopPropagation();
          onWheel?.(event);
        }}
        className={cn(
          'scrollbar-custom bg-container-neutral z-90 flex max-h-[min(var(--radix-dropdown-menu-content-available-height),320px)] min-w-[144px] touch-pan-y flex-col items-center overflow-y-auto overscroll-contain rounded-md shadow-[0px_4px_14px_0px_rgba(0,0,0,0.25)] [-webkit-overflow-scrolling:touch]',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          type === 'position' && 'w-[var(--radix-dropdown-menu-trigger-width)] min-w-0',
          className,
        )}
        {...props}
      />
    </DropdownMenuPortal>
  );
}

function DropdownMenuItem({
  className,
  destructive = false,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  destructive?: boolean;
}) {
  const type = React.useContext(DropdownMenuTypeContext);
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'typo-button1 flex h-12 w-full shrink-0 cursor-pointer items-center px-400 outline-none',
        'focus:bg-container-neutral-interaction',
        destructive ? 'text-state-error' : 'text-text-normal',
        type === 'position' && 'justify-center px-0',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-line h-px w-[calc(100%-8px)]', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
};
