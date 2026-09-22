import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';

const ROWS = 5;

function CalendarGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div className="bg-container-neutral overflow-hidden rounded-md">
        {/* Weekday header row */}
        <div className="border-line grid grid-cols-[repeat(7,minmax(92px,1fr))] border-b">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex h-[33px] items-center justify-center">
              <Skeleton className="h-[12px] w-[14px]" />
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-[repeat(7,minmax(92px,1fr))]">
          {Array.from({ length: ROWS * 7 }).map((_, i) => {
            const col = i % 7;
            const row = Math.floor(i / 7);
            return (
              <div
                key={i}
                className={cn(
                  'flex h-[80px] flex-col items-start justify-self-stretch overflow-hidden p-[6px]',
                  row < ROWS - 1 && 'border-line border-b',
                  col < 6 && 'border-line border-r',
                )}
              >
                {/* Date circle */}
                <div className="flex h-6 w-full justify-end">
                  <Skeleton className="size-5 rounded-full" />
                </div>
                {/* Event tag */}
                <div className="w-full pt-[4px]">
                  <Skeleton className="h-[20px] w-full rounded-[5px]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { CalendarGridSkeleton };
