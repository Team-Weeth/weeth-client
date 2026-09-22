import { Skeleton } from '@/components/ui/skeleton';

function PostCardSkeleton() {
  return (
    <div className="bg-container-neutral flex flex-col gap-300 rounded-lg p-450">
      <div className="flex items-center gap-300">
        <Skeleton className="h-[36px] w-[36px] rounded-full" />
        <div className="flex flex-col gap-[4px]">
          <Skeleton className="h-[14px] w-[80px] rounded-md" />
          <Skeleton className="h-[12px] w-[48px] rounded-md" />
        </div>
      </div>
      <div className="flex flex-col gap-200">
        <Skeleton className="h-[18px] w-[60%] rounded-md" />
        <Skeleton className="h-[14px] w-full rounded-md" />
        <Skeleton className="h-[14px] w-[80%] rounded-md" />
      </div>
      <div className="flex gap-300">
        <Skeleton className="h-[14px] w-[40px] rounded-md" />
        <Skeleton className="h-[14px] w-[40px] rounded-md" />
      </div>
    </div>
  );
}

export function HomeBoardContentSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-400">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
