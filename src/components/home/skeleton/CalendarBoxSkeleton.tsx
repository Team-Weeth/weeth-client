import { Skeleton } from '@/components/ui';

export function CalendarBoxSkeleton() {
  return (
    <div className="bg-container-neutral rounded-lg">
      <div className="p-450">
        <Skeleton className="h-[20px] w-[80px] rounded-md" />
      </div>
      <div className="flex flex-col gap-400 p-450">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-200">
            <Skeleton className="h-[16px] w-[100px] rounded-md" />
            <div className="bg-container-neutral-alternative flex gap-[10px] rounded-md py-[10px] pl-[5px]">
              <Skeleton className="h-[45px] w-[5px] rounded-xl" />
              <div className="flex flex-col gap-[5px]">
                <Skeleton className="h-[16px] w-[140px] rounded-md" />
                <Skeleton className="h-[12px] w-[100px] rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
