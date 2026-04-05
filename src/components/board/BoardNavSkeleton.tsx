import { Skeleton } from '@/components/ui';

function BoardNavSkeleton() {
  return (
    <div className="bg-container-neutral flex w-[304px] flex-col items-start rounded-lg">
      {/* 헤더 */}
      <div className="self-stretch px-450 pt-450 pb-300">
        <Skeleton className="h-5 w-20" />
      </div>

      {/* 채널 목록 */}
      <div className="flex flex-col gap-200 self-stretch px-450 py-400">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export { BoardNavSkeleton };
