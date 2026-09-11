import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';

const TITLE_WIDTHS = ['w-[100px]', 'w-[80px]', 'w-[90px]', 'w-[120px]'] as const;

function CalendarUpcomingPanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex max-h-[346px] shrink-0 flex-col items-start self-stretch rounded-md px-[14px] pt-[14px] pb-200',
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-[26px] w-[243px] shrink-0 items-center justify-between pb-200">
        <Skeleton className="h-[14px] w-[70px]" />
        <Skeleton className="h-[12px] w-[30px]" />
      </div>

      {/* Items */}
      <div className="flex w-full flex-1 flex-col gap-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex w-[245px] items-center gap-[7px] p-200">
            {/* Date column */}
            <div className="flex w-[32px] shrink-0 flex-col items-center gap-100">
              <Skeleton className="h-[18px] w-[28px]" />
              <Skeleton className="h-[12px] w-[20px]" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-200">
              <div className="flex items-center gap-[6px]">
                <Skeleton className="size-[6px] shrink-0 rounded-full" />
                <Skeleton className={cn('h-[14px]', TITLE_WIDTHS[i])} />
              </div>
              <div className="flex gap-100">
                <Skeleton className="h-[20px] w-[55px] rounded-sm" />
                <Skeleton className="h-[20px] w-[80px] rounded-sm" />
              </div>
            </div>

            {/* Arrow icon */}
            <Skeleton className="size-[10px] shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { CalendarUpcomingPanelSkeleton };
