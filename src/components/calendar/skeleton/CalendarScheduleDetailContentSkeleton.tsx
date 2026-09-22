import { Skeleton } from '@/components/ui/skeleton';

function CalendarScheduleDetailContentSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between py-600 pr-400 pl-700">
        <div className="flex flex-col gap-400">
          <Skeleton className="h-6 w-[140px]" />
          <div className="flex flex-wrap items-center gap-200">
            <Skeleton className="h-[22px] w-[40px] rounded-sm" />
            <Skeleton className="h-[22px] w-[160px] rounded-sm" />
            <Skeleton className="h-[22px] w-[80px] rounded-sm" />
          </div>
        </div>
        <Skeleton className="size-[40px] shrink-0 rounded-sm" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-500 px-700 pb-500">
        {/* Details */}
        <div className="border-line flex flex-col gap-[14px] border-t pt-600">
          {/* Location */}
          <div className="flex items-center gap-300">
            <Skeleton className="h-[12px] w-[56px] shrink-0" />
            <Skeleton className="h-[14px] w-[80px]" />
          </div>
          {/* Host */}
          <div className="flex items-center gap-300">
            <Skeleton className="h-[12px] w-[56px] shrink-0" />
            <div className="flex items-center gap-200">
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <Skeleton className="h-[14px] w-[60px]" />
            </div>
          </div>
          {/* Attendees */}
          <div className="flex items-center gap-300">
            <Skeleton className="h-[12px] w-[56px] shrink-0" />
            <div className="flex items-center gap-200">
              <div className="flex -space-x-[6px]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="size-6 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-[12px] w-[40px]" />
            </div>
          </div>
          {/* Description */}
          <div className="flex items-start gap-300">
            <Skeleton className="mt-[2px] h-[12px] w-[56px] shrink-0" />
            <div className="flex flex-1 flex-col gap-100">
              <Skeleton className="h-[14px] w-full" />
              <Skeleton className="h-[14px] w-4/5" />
            </div>
          </div>
        </div>

        {/* Attendance card */}
        <div className="bg-container-neutral flex flex-col gap-200 rounded-md px-400 pt-200 pb-400">
          <div className="flex items-center gap-300 py-[13px]">
            <Skeleton className="size-[40px] shrink-0 rounded-md" />
            <div className="flex flex-col gap-[3px]">
              <Skeleton className="h-[14px] w-[80px]" />
              <Skeleton className="h-[12px] w-[160px]" />
            </div>
          </div>
          <Skeleton className="h-[36px] w-[140px] rounded-sm" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-400 pb-400">
        <div className="border-line border-t pt-[10px]">
          <Skeleton className="h-[48px] w-full rounded-sm" />
        </div>
      </div>
    </>
  );
}

export { CalendarScheduleDetailContentSkeleton };
