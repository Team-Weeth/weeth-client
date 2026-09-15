import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';

function CalendarMobileGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      {/* Weekday header row */}
      <div className="grid grid-cols-7 pb-100">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex h-7 items-center justify-center">
            <Skeleton className="size-[10px]" />
          </div>
        ))}
      </div>

      {/* Date cells: 5 rows × 7 */}
      <div className="grid grid-cols-7 gap-y-200">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="flex h-11 flex-col items-center justify-center gap-[3px]">
            <Skeleton className="size-7 rounded-full" />
            {/* dots placeholder */}
            <div className="h-[4px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { CalendarMobileGridSkeleton };
