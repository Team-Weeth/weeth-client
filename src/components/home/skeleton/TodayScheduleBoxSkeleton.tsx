import { Skeleton } from '@/components/ui';

export function TodayScheduleBoxSkeleton() {
  return (
    <div className="bg-container-neutral rounded-lg">
      <p className="typo-sub1 text-text-strong p-450">오늘의 일정</p>
      <div className="flex flex-col gap-[14px] p-450">
        <Skeleton className="h-[20px] w-[160px] rounded-md" />
        <div className="flex gap-200">
          <Skeleton className="h-[30px] w-[120px] rounded-full" />
          <Skeleton className="h-[30px] w-[80px] rounded-full" />
        </div>
        <Skeleton className="h-[48px] w-full rounded-lg" />
      </div>
    </div>
  );
}
