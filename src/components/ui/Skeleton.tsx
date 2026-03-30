import { cn } from '@/lib/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-container-neutral-interaction',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps };
