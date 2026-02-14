import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'lg' | 'md' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-button-primary text-text-inverse',
    'hover:bg-button-primary-interaction',
    'active:bg-button-primary-interaction',
    'disabled:bg-button-neutral disabled:text-text-disabled',
  ),
  secondary: cn(
    'bg-button-neutral text-text-normal',
    'hover:bg-button-neutral-interaction',
    'active:bg-button-neutral-interaction',
    'disabled:bg-button-neutral disabled:text-text-disabled',
  ),
  tertiary: cn(
    'bg-transparent text-text-normal',
    'hover:bg-container-neutral-interaction',
    'active:bg-container-neutral-interaction',
    'disabled:text-text-disabled',
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  lg: 'typo-button1 px-400 py-300 rounded-md',
  md: 'typo-button2 px-300 py-200 rounded-sm',
  sm: 'typo-button2 px-200 py-100 rounded-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-colors',
          'cursor-pointer disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
