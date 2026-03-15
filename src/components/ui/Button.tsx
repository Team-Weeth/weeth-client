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
        danger:
          'bg-state-error text-text-strong hover:opacity-90 active:opacity-80 disabled:bg-button-neutral disabled:text-text-disabled',
      },
      size: {
        lg: 'typo-button1 px-400 py-300 rounded-md',
        md: 'typo-button2 px-300 py-200 rounded-md',
        sm: 'typo-button2 px-200 py-100 rounded-sm',
        'icon-md': 'rounded-sm p-200',
        'icon-sm': 'rounded-sm p-100',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({ className, variant, size, ref, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants, type ButtonProps };
