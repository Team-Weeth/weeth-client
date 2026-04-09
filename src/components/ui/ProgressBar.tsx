import { cn } from '@/lib/cn';

import { Progress } from './progress';

interface ProgressBarProps {
  value: number;
  className?: string;
}

function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <Progress
      value={value}
      className={cn('h-3', className)}
      indicatorClassName="bg-gradient-to-r from-container-primary to-button-primary-interaction"
    />
  );
}

export { ProgressBar, type ProgressBarProps };
