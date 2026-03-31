import { Skeleton } from '@/components/ui';

export function UnreadNoticeBoxSkeleton() {
  return (
    <div className="flex flex-col rounded-lg shadow-[0_5px_20px_0_rgba(17,33,49,0.2)]">
      <div className="bg-icon-normal flex items-center justify-between rounded-t-lg px-450 pt-450 pb-300">
        <Skeleton className="h-[20px] w-[180px] bg-white/20" />
      </div>
      <div className="bg-container-neutral flex flex-col gap-[5px] rounded-b-lg px-450 py-400">
        <Skeleton className="h-[18px] w-[140px] rounded-md" />
        <Skeleton className="h-[14px] w-full rounded-md" />
      </div>
    </div>
  );
}
