import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-button-primary text-text-inverse hover:bg-button-primary-interaction active:bg-button-primary-interaction disabled:bg-button-neutral disabled:text-text-disabled',
        secondary:
          'bg-button-neutral text-text-normal hover:bg-button-neutral-interaction active:bg-button-neutral-interaction disabled:bg-button-neutral disabled:text-text-disabled',
        tertiary:
          'bg-transparent text-text-normal hover:bg-container-neutral-interaction active:bg-container-neutral-interaction disabled:text-text-disabled',
      },
      size: {
        lg: 'typo-button1 px-400 py-300 rounded-md',
        md: 'typo-button2 px-300 py-200 rounded-sm',
        sm: 'typo-button2 px-200 py-100 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants, type ButtonProps };
