'use client';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const generationCardVariants = cva(
  'flex h-[164px] w-[234px] shrink-0 flex-col justify-between rounded-sm p-400 text-left',
  {
    variants: {
      variant: {
        active: 'bg-button-primary text-text-inverse',
        normal: 'bg-container-neutral text-text-strong',
      },
    },
    defaultVariants: {
      variant: 'normal',
    },
  },
);

interface GenerationCardProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof generationCardVariants> {
  title: string;
  subtitle?: string;
  description?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function GenerationCard({
  className,
  variant,
  title,
  subtitle,
  description,
  ref,
  ...props
}: GenerationCardProps) {
  return (
    <button ref={ref} className={cn(generationCardVariants({ variant }), className)} {...props}>
      <span className="typo-sub2">{subtitle}</span>
      <div className="flex flex-col gap-100">
        <p className="typo-h3">{title}</p>
        {description && <p className="typo-caption2 opacity-50">{description}</p>}
      </div>
    </button>
  );
}

export { GenerationCard, generationCardVariants, type GenerationCardProps };
