import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

function BoardCardSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-container-neutral tablet:gap-400 flex w-full items-center gap-300 rounded-sm px-500 py-400 shadow-sm',
        className,
      )}
      {...props}
    >
      {/* Drag handle + icon + title/desc */}
      <div className="tablet:gap-400 flex min-w-0 flex-1 items-center gap-300">
        {/* Drag handle (tablet+) */}
        <Skeleton className="tablet:block hidden size-10 shrink-0 rounded-sm" />
        {/* Icon badge */}
        <Skeleton className="size-10 shrink-0 rounded-sm" />
        {/* Title + description */}
        <div className="flex min-w-0 flex-1 flex-col gap-200">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>

      {/* Post count (tablet+) */}
      <div className="tablet:flex hidden w-[88px] shrink-0 flex-col gap-200">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-5 w-6" />
      </div>

      {/* Comment toggle (desktop+) */}
      <div className="desktop:flex hidden w-[88px] shrink-0 flex-col gap-100">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-6 w-10 rounded-full" />
      </div>

      {/* Visibility tag (desktop+) */}
      <div className="desktop:flex hidden w-24 shrink-0">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Action buttons placeholder */}
      <div className="w-[106px] shrink-0" aria-hidden />
    </div>
  );
}

export { BoardCardSkeleton };
