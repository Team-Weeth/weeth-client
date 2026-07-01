'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { cn } from '@/lib/cn';

const checkboxVariants = cva(
  'peer border-icon-alternative size-4 shrink-0 cursor-pointer rounded-[4px] border outline-none transition-shadow focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-text-inverse',
  {
    variants: {
      color: {
        primary: 'data-[state=checked]:border-brand-primary data-[state=checked]:bg-brand-primary',
        alternative:
          'data-[state=checked]:border-icon-alternative data-[state=checked]:bg-icon-alternative',
      },
    },
    defaultVariants: {
      color: 'primary',
    },
  },
);

interface CheckboxProps
  extends
    Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, 'color'>,
    VariantProps<typeof checkboxVariants> {}

function Checkbox({ className, color, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ color }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, checkboxVariants, type CheckboxProps };
