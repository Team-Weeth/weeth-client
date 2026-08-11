import { Skeleton } from '@/components/ui/skeleton';

function ProfileSectionSkeleton() {
  return (
    <div className="bg-container-neutral w-full overflow-hidden rounded-lg">
      <Skeleton className="h-[168px] w-full rounded-none" />
      <div className="px-600 pb-500">
        <div className="-mt-16 flex items-end justify-between">
          <Skeleton className="size-32 rounded-full ring-4 ring-white" />
          <div className="mb-200 flex items-center gap-200">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-3 rounded-full" />
          </div>
        </div>
        <div className="mt-300 flex items-start justify-between gap-400">
          <div className="flex flex-col gap-100">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-5 w-40" />
            <div className="mt-100 flex gap-400">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-36" />
            </div>
          </div>
          <Skeleton className="h-6 w-36 rounded-full" />
        </div>
        <div className="bg-container-neutral-alternative mt-400 flex overflow-hidden rounded-lg">
          <div className="flex flex-1 flex-col items-center gap-100 py-400">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-12" />
          </div>
          <div className="bg-container-neutral my-400 w-px" />
          <div className="flex flex-1 flex-col items-center gap-100 py-400">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="bg-container-neutral flex w-full flex-col gap-400 rounded-lg p-450">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-400">
          <Skeleton className="h-5 w-[78px]" />
          <Skeleton className="h-5 flex-1" />
        </div>
      ))}
    </div>
  );
}

function ClubInfoCardSkeleton() {
  return (
    <div className="bg-container-neutral flex w-[340px] flex-col gap-400 rounded-lg p-450">
      <div className="flex items-start justify-between">
        <Skeleton className="size-16 rounded-lg" />
        <Skeleton className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-100">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex items-center gap-200">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex flex-col gap-200">
        <Skeleton className="h-4 w-16" />
        <div className="flex gap-100">
          <Skeleton className="h-8 w-14 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export { ProfileSectionSkeleton, InfoCardSkeleton, ClubInfoCardSkeleton };
