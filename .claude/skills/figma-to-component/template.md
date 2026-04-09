```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const variants = cva('base-styles', {
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { lg: '...', md: '...', sm: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

interface Props extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof variants> {}

function Component({ className, variant, size, ...props }: Props) {
  return <div className={cn(variants({ variant, size }), className)} {...props} />;
}

export { Component, variants, type Props };
```
