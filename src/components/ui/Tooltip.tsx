'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { AdminScopeBoundary } from '@/providers';

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

const tooltipContentVariants = cva(
  'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-[100] w-fit origin-(--radix-tooltip-content-transform-origin) rounded-sm break-keep',
  {
    variants: {
      variant: {
        default:
          'bg-container-primary-interaction text-text-inverse typo-body2 p-200 [box-shadow:var(--shadow-sm)]',
        sm: 'bg-container-neutral-alternative text-text-strong typo-caption2 px-200 py-100 [box-shadow:var(--shadow-sm)]',
        dark: 'typo-sub1 bg-container-floating text-text-on-floating flex items-center justify-center gap-[10px] rounded-sm px-[14px] py-[10px] shadow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface TooltipContentProps
  extends
    React.ComponentProps<typeof TooltipPrimitive.Content>,
    VariantProps<typeof tooltipContentVariants> {}

function TooltipContent({
  className,
  sideOffset = 8,
  variant,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <AdminScopeBoundary>
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          sideOffset={sideOffset}
          className={cn(tooltipContentVariants({ variant }), className)}
          {...props}
        >
          {children}
        </TooltipPrimitive.Content>
      </AdminScopeBoundary>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, tooltipContentVariants };
export type { TooltipContentProps };
