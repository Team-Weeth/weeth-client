import React from 'react';

import { cn } from '@/lib/cn';

interface SelectedCountLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  label?: string;
  countClassName?: string;
  labelClassName?: string;
}

function SelectedCountLabel({
  className,
  count,
  label = '명 선택됨',
  countClassName,
  labelClassName,
  ...props
}: SelectedCountLabelProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-200 border-r border-neutral-700 pr-200',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'bg-button-primary text-text-inverse typo-caption1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-[7px]',
          countClassName,
        )}
      >
        {count}
      </span>
      <span className={cn('typo-button2 text-text-alternative shrink-0', labelClassName)}>
        {label}
      </span>
    </div>
  );
}

export { SelectedCountLabel, type SelectedCountLabelProps };
