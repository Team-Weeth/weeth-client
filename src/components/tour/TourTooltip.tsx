'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { AdminScopeBoundary } from '@/providers/admin-scope-provider';

import type { TooltipRenderProps } from 'react-joyride';

const tourTooltipVariants = cva(
  'bg-container-floating text-text-on-floating border-floating-border flex flex-col gap-300 rounded-md border p-400 shadow-md',
  {
    variants: {
      tone: {
        default: '',
        brand: 'border-brand-primary',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
);

interface TourTooltipProps extends TooltipRenderProps, VariantProps<typeof tourTooltipVariants> {
  className?: string;
}

function TourTooltip({
  index,
  size,
  isLastStep,
  step,
  tooltipProps,
  primaryProps,
  skipProps,
  tone,
  className,
}: TourTooltipProps) {
  return (
    <AdminScopeBoundary>
      <div {...tooltipProps} className={cn(tourTooltipVariants({ tone }), className)}>
        <span className="typo-caption1 text-text-alternative">
          {index + 1}/{size}
        </span>
        {step.title ? <strong className="typo-sub3">{step.title}</strong> : null}
        <div className="typo-body2 break-keep">{step.content}</div>
        <div className="flex items-center justify-end gap-200">
          {size > 1 && !isLastStep ? (
            <Button {...skipProps} variant="tertiary" size="sm">
              건너뛰기
            </Button>
          ) : null}
          <Button {...primaryProps} variant="primary" size="sm">
            {isLastStep ? '시작하기' : '다음'}
          </Button>
        </div>
      </div>
    </AdminScopeBoundary>
  );
}

export { TourTooltip, tourTooltipVariants, type TourTooltipProps };
