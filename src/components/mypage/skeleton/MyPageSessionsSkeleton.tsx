import { Skeleton } from '@/components/ui/skeleton';

function MyPageSessionsSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex items-start gap-1">
        <Skeleton className="mt-1 size-8 rounded-md" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      <div className="bg-container-neutral divide-line divide-y overflow-hidden rounded-lg">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-400 px-500 py-400">
            <div className="flex w-[44px] shrink-0 flex-col items-center gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-9" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-6 w-40" />
              <div className="flex flex-wrap items-center gap-200">
                <Skeleton className="h-7 w-12 rounded-full" />
                <Skeleton className="h-7 w-40 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { MyPageSessionsSkeleton };
