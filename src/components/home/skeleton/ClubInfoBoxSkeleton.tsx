import { Skeleton } from '@/components/ui/skeleton';

export function ClubInfoBoxSkeleton() {
  return (
    <div className="bg-container-neutral flex w-full flex-col rounded-lg px-450 pt-[22px] pb-450">
      <div className="mb-300 flex gap-200">
        <Skeleton className="h-[32px] w-[80px] rounded-md" />
        <Skeleton className="h-[32px] w-[80px] rounded-md" />
      </div>

      <div className="flex items-center gap-4 px-200 py-300">
        <Skeleton className="h-[64px] w-[64px] rounded-md" />
        <div className="flex flex-col gap-[6px]">
          <Skeleton className="h-[18px] w-[120px] rounded-md" />
          <Skeleton className="h-[14px] w-[160px] rounded-md" />
        </div>
      </div>

      <Skeleton className="my-300 h-[1px] w-full" />
      <div className="flex justify-between px-[10px] py-450">
        <Skeleton className="h-[16px] w-[48px] rounded-md" />
        <Skeleton className="h-[16px] w-[40px] rounded-md" />
      </div>

      <Skeleton className="h-[44px] w-full rounded-lg" />
    </div>
  );
}
