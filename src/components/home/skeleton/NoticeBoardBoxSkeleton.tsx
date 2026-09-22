import { Skeleton } from '@/components/ui/skeleton';

export function NoticeBoardBoxSkeleton() {
  return (
    <div className="bg-container-neutral flex flex-col rounded-lg pb-300">
      <div className="flex items-center justify-between p-450">
        <Skeleton className="h-[20px] w-[32px] rounded-md" />
        <Skeleton className="h-[16px] w-[16px] rounded-md" />
      </div>
      <div className="flex flex-col gap-300 px-450">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-200 py-400">
            <Skeleton className="h-[16px] w-[70%] rounded-md" />
            <Skeleton className="h-[14px] w-full rounded-md" />
            <Skeleton className="h-[14px] w-[40%] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
