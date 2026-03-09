import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const tagVariants = cva(
  'typo-caption1 inline-flex w-fit items-center rounded-sm px-200 py-100 whitespace-nowrap',
  {
    variants: {
      variant: {
        notice: 'text-state-error bg-state-error/10',
      },
    },
    defaultVariants: {
      variant: 'notice',
    },
  },
);

interface TagProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {
  asChild?: boolean;
}

function Tag({ className, variant, asChild = false, ...props }: TagProps) {
  const Comp = asChild ? Slot.Root : 'span';
  return <Comp className={cn(tagVariants({ variant }), className)} {...props} />;
}

export { Tag, tagVariants, type TagProps };
