import { cn } from '@/lib/cn';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'inverse';
  className?: string;
};

function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'typo-caption1 rounded-[5px] px-200 py-100',
        {
          'bg-brand-primary/10 text-brand-primary': variant === 'primary',
          'bg-white/30 text-white': variant === 'inverse',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps };
