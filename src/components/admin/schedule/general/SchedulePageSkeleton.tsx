import { Card, Skeleton } from '@/components/ui';

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
    <div className="tablet:p-700 flex min-w-0 flex-col gap-400 p-400">
      <Skeleton className="h-8 w-36 rounded-sm" />

      <div className="flex flex-col gap-0">
        <div className="border-line flex h-8 gap-0 border-b">
          <Skeleton className="h-7 w-20 rounded-none" />
          <Skeleton className="ml-400 h-7 w-14 rounded-none" />
        </div>

        <div className="mt-400">
          <Card className="tablet:gap-700 tablet:px-600 tablet:pt-600 tablet:pb-800 min-w-78 gap-600 px-400 pt-400 pb-600">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-sm" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-8 w-8 rounded-sm" />
            </div>

            <div className="tablet:flex-row flex flex-col gap-300">
              <Skeleton className="tablet:w-123 h-12 w-full rounded-sm" />
              <Skeleton className="tablet:w-36 h-12 w-full rounded-sm" />
            </div>

            <ScheduleListSkeleton />
          </Card>
        </div>
      </div>
    </div>
  );
}

export { SchedulePageSkeleton, ScheduleListSkeleton };
