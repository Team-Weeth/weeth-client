'use client';

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/cn';

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>['children'];
  ref?: React.Ref<HTMLDivElement>;
}

function ChartContainer({
  className,
  children,
  config: _config,
  ref,
  ...props
}: ChartContainerProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex justify-center [&_.recharts-cartesian-axis-tick_text]:fill-current [&_.recharts-surface]:outline-none',
        className,
      )}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export { ChartContainer };
