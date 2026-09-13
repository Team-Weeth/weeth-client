'use client';

import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from '@/lib/cn';
import { AdminScopeBoundary } from '@/providers';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverPortal({
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Portal>) {
  return (
    <PopoverPrimitive.Portal data-slot="popover-portal" {...props}>
      <AdminScopeBoundary>{children}</AdminScopeBoundary>
    </PopoverPrimitive.Portal>
  );
}

function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-container-neutral z-90 flex w-72 flex-col rounded-md shadow-[0px_4px_14px_0px_rgba(0,0,0,0.25)] outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      />
    </PopoverPortal>
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverPortal };
