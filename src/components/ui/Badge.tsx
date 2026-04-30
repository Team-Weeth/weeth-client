import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badgeVariants = cva('typo-caption1 rounded-[5px] px-200 py-100', {
  variants: {
    variant: {
      primary: 'bg-brand-primary/10 text-brand-primary',
      inverse: 'bg-white/30 text-white',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants, type BadgeProps };
