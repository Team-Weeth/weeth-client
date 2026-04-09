'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const dividerVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full bg-line',
      vertical: 'w-px h-full bg-line',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

interface DividerProps
  extends React.HTMLAttributes<HTMLHRElement>, VariantProps<typeof dividerVariants> {}

function Divider({ className, orientation, ...props }: DividerProps) {
  return (
    <hr
      className={cn(dividerVariants({ orientation }), className)}
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      {...props}
    />
  );
}

export { Divider, dividerVariants };
export type { DividerProps };
