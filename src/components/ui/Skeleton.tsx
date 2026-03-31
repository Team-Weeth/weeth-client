import { cn } from '@/lib/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('bg-container-neutral-interaction animate-pulse rounded', className)}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
