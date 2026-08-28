import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const tagVariants = cva(
  'typo-caption1 inline-flex w-fit items-center gap-[5px] rounded-sm px-200 py-100 whitespace-nowrap',
  {
    variants: {
      variant: {
        // status
        caution: 'text-state-caution bg-state-caution/10',
        error: 'text-state-error bg-state-error/10',
        success: 'text-state-success bg-state-success/10',
        complete: 'text-brand-primary bg-brand-primary/10',
        end: 'text-text-alternative bg-[#6E71730D]',
        // normal
        neutral: 'text-text-normal bg-[#6E71731A]',
        pink: 'text-brand-pink bg-brand-pink/10',
        primary: 'bg-brand-primary/10 text-brand-primary',
        purple: 'text-brand-purple bg-brand-purple/10',
        secondary: 'text-brand-secondary bg-brand-secondary/10',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

interface TagProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {
  asChild?: boolean;
  dot?: boolean;
  onDelete?: () => void;
  ref?: React.Ref<HTMLSpanElement>;
}

function Tag({
  className,
  variant,
  asChild = false,
  dot,
  onDelete,
  ref,
  children,
  ...props
}: TagProps) {
  const Comp = asChild ? Slot.Root : 'span';
  if (asChild) {
    return (
      <Comp ref={ref} className={cn(tagVariants({ variant }), className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <span className={cn(tagVariants({ variant }), className)} {...props}>
      {dot && <span className="size-[5px] shrink-0 rounded-full bg-current" />}
      {children}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="flex shrink-0 items-center justify-center"
          aria-label="태그 삭제"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="7" fill="currentColor" />
            <path
              d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

export { Tag, tagVariants, type TagProps };
