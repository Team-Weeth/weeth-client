import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const cardinalTagVariants = cva(
  'bg-container-neutral-alternative text-text-alternative whitespace-nowrap',
  {
    variants: {
      size: {
        /** 표 행 (MemberTableRow / PenaltyTableRow) */
        md: 'rounded-[5px] px-2.5 py-[5px] text-[14px] leading-5 font-semibold tracking-[var(--letter-spacing)]',
        /** 카드 (MemberCard) */
        sm: 'typo-caption2 flex h-5 min-w-[30px] items-center justify-center rounded px-[6px] py-[2px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface CardinalTagProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof cardinalTagVariants> {
  ref?: React.Ref<HTMLSpanElement>;
}

function CardinalTag({ className, size, ref, ...props }: CardinalTagProps) {
  return <span ref={ref} className={cn(cardinalTagVariants({ size }), className)} {...props} />;
}

export { CardinalTag, cardinalTagVariants, type CardinalTagProps };
