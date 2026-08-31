import { Skeleton } from '@/components/ui/skeleton';

function MyPageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1088px] flex-col items-center gap-[35px] px-450 pt-450 pb-[80px]">
      <div className="flex w-full flex-col gap-200">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-9 w-12" />
      </div>

      <div className="flex w-full flex-col gap-700">
        <div className="flex items-center gap-300">
          <Skeleton className="size-32 shrink-0 rounded-full" />
          <div className="flex flex-col gap-200">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        <div className="flex flex-col gap-400">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-[168px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
        </div>

        <div className="flex flex-col gap-400">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-[200px] w-[340px] rounded-lg" />
        </div>

        <div className="flex flex-col gap-400">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-[100px] w-full rounded-lg" />
        </div>

        <div className="flex flex-col gap-400">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export { MyPageSkeleton };
