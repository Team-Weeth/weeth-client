'use client';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const cardinalCardVariants = cva(
  'typo-button2 inline-flex h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center rounded-md px-400 py-200 whitespace-nowrap',
  {
    variants: {
      variant: {
        active: 'bg-button-primary text-text-inverse',
        normal: 'bg-button-neutral border-line text-text-strong border',
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
  ref?: React.Ref<HTMLButtonElement>;
}

function CardinalCard({
  className,
  variant,
  title,
  ref,
  type = 'button',
  ...props
}: CardinalCardProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(cardinalCardVariants({ variant }), className)}
      {...props}
    >
      {title}
    </button>
  );
}

export { CardinalCard, cardinalCardVariants, type CardinalCardProps };
