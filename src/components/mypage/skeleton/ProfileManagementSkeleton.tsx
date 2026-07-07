import { Skeleton } from '@/components/ui';

function ProfileManagementCardSkeleton() {
  return (
    <div className="bg-container-neutral flex w-full flex-col gap-[18px] rounded-lg">
      <div className="bg-container-neutral-alternative relative flex items-center gap-300 rounded-md p-450">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="absolute top-2 right-2 size-7 rounded-md" />
      </div>

      <div className="divide-line divide-y">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-[14px] first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-200">
              <Skeleton className="size-9 rounded-md" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-8 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileManagementSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex items-start gap-1">
        <Skeleton className="mt-1 size-8 rounded-md" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-[420px] max-w-full" />
        </div>
      </div>

      <div className="bg-container-neutral flex flex-col rounded-lg p-450">
        <Skeleton className="mb-[18px] h-6 w-28" />
        <div className="grid grid-cols-3 gap-x-300 gap-y-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <ProfileManagementCardSkeleton key={index} />
          ))}
        </div>
        <Skeleton className="mt-6 h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}

export { ProfileManagementSkeleton };
