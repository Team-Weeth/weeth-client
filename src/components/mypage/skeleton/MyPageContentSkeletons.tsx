import { Skeleton } from '@/components/ui';

function ProfileSectionSkeleton() {
  return (
    <div className="flex items-center gap-300">
      <Skeleton className="size-32 shrink-0 rounded-full" />
      <div className="flex flex-col gap-200">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-48" />
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
