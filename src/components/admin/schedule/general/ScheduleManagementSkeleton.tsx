import { Skeleton } from '@/components/ui/skeleton';

function ScheduleManagementSkeleton() {
  return (
    <div className="tablet:p-700 flex min-w-0 flex-col gap-400 p-400">
      {/* Header row */}
      <div className="flex items-center justify-between gap-400">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center gap-300">
          <Skeleton className="h-[34px] w-9 rounded-[10px]" />
          <Skeleton className="h-10 w-28 rounded-sm" />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-200">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-14 rounded-full" />
      </div>

      {/* Month nav row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-300">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-8" />
        </div>
        <Skeleton className="h-10 w-28 rounded-sm" />
      </div>

      {/* Calendar grid skeleton */}
      <div className="flex items-start gap-400">
        <div className="bg-container-neutral min-w-0 flex-1 overflow-hidden rounded-md">
          {/* Weekday header */}
          <div className="border-line grid grid-cols-7 border-b">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex h-[33px] items-center justify-center">
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
          {/* Date cells (5 rows x 7 cols) */}
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="border-line flex h-[80px] flex-col items-end border-r border-b p-[6px] last:border-r-0 [&:nth-child(7n)]:border-r-0"
              >
                <Skeleton className="size-5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Side panel skeleton */}
        <div className="desktop:flex hidden flex-col gap-300">
          <Skeleton className="h-10 w-[195px] rounded-md" />
          <Skeleton className="h-[200px] w-[195px] rounded-md" />
          <Skeleton className="h-[200px] w-[273px] rounded-md" />
        </div>
      </div>
    </div>
  );
}

export { ScheduleManagementSkeleton };
