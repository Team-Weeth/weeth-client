import { Skeleton } from '@/components/ui';

function BoardNavSkeleton() {
  return (
    <>
      {/* Mobile: CategorySelector 형태의 스켈레톤 */}
      <Skeleton className="tablet:hidden h-10 w-full rounded-lg" />

      {/* Tablet+: 사이드바 형태의 스켈레톤 */}
      <div className="bg-container-neutral tablet:flex hidden w-[304px] flex-col items-start rounded-lg">
        <div className="self-stretch px-450 pt-450 pb-300">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex flex-col gap-200 self-stretch px-450 py-400">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    </>
  );
}

export { BoardNavSkeleton };
