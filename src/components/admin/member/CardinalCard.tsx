'use client';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const cardinalCardVariants = cva(
  'typo-sub1 relative inline-flex h-14 w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-sm text-center whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        active:
          'text-text-strong after:bg-text-strong after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:content-[""]',
        normal: 'text-text-alternative hover:text-text-normal',
      },
    },
    defaultVariants: {
      variant: 'normal',
    },
  },
);

interface CardinalCardProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof cardinalCardVariants> {
  title: string;
  endIcon?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

function CardinalCard({
  className,
  variant,
  title,
  endIcon,
  ref,
  type = 'button',
  ...props
}: CardinalCardProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        cardinalCardVariants({ variant }),
        endIcon && 'w-auto gap-100 px-100',
        className,
      )}
      {...props}
    >
      {title}
      {endIcon}
    </button>
  );
}

export { CardinalCard, cardinalCardVariants, type CardinalCardProps };
