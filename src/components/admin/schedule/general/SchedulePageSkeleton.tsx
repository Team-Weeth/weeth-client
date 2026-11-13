import { Skeleton } from '@/components/ui/skeleton';

function ScheduleListSkeleton() {
  return (
    <div className="border-line bg-container-neutral overflow-hidden rounded-sm border">
      <div className="bg-container-neutral-alternative border-line border-b px-400 py-300">
        <Skeleton className="h-5 w-16" />
      </div>
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="border-line tablet:gap-600 tablet:px-500 tablet:py-400 flex items-start gap-400 border-b px-400 py-300 last:border-b-0"
        >
          <div className="flex w-11 shrink-0 flex-col items-center gap-100 self-stretch">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-6" />
          </div>
          <div className="flex flex-1 flex-col gap-200 self-stretch">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-200">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="tablet:flex-row flex shrink-0 flex-col gap-200">
            <Skeleton className="h-9 w-14 rounded-sm" />
            <Skeleton className="h-9 w-14 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SchedulePageSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-300 p-700">
        <Skeleton className="size-10 rounded-sm" />
        <Skeleton className="h-9 w-48" />
      </div>

      <div className="flex flex-col gap-[22px] px-500">
        <Skeleton className="h-12 w-[187px] rounded-md" />

        <div className="bg-background flex flex-col gap-700 rounded-lg p-600">
          <Skeleton className="h-5 w-24" />

          <div className="flex items-center justify-between gap-400">
            <Skeleton className="h-12 flex-1 rounded-sm" />
            <Skeleton className="h-12 w-32 rounded-md" />
          </div>

          <ScheduleListSkeleton />
        </div>
      </div>
    </div>
  );
}

export { SchedulePageSkeleton, ScheduleListSkeleton };
