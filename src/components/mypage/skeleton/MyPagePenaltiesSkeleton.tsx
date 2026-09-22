import { Skeleton } from '@/components/ui/skeleton';

function MyPagePenaltiesSkeleton() {
  return (
    <div className="bg-container-neutral divide-line divide-y overflow-hidden rounded-lg">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-400 px-500 py-400">
          <Skeleton className="h-[26px] w-[60px] shrink-0 rounded-sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-100">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export { MyPagePenaltiesSkeleton };
