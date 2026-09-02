import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';

function CalendarMiniSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-container-neutral w-[195px] overflow-hidden rounded-md', className)}>
      <div className="flex flex-col px-[14px] pt-300 pb-200">
        {/* Header: year/month + nav buttons */}
        <div className="flex items-center justify-between pb-[8px]">
          <Skeleton className="h-[14px] w-[60px]" />
          <div className="flex gap-200">
            <Skeleton className="size-5 rounded-sm" />
            <Skeleton className="size-5 rounded-sm" />
          </div>
        </div>

        {/* Weekday header row */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex h-[18px] w-6 items-center justify-center">
              <Skeleton className="h-[10px] w-[10px]" />
            </div>
          ))}
        </div>

        {/* Date grid: 5 rows × 7 cols */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-[26px] w-6 rounded-[4px]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export { CalendarMiniSkeleton };
