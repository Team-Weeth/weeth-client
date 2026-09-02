import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';

function CalendarFilterSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-container-neutral w-[195px] rounded-md p-300', className)}>
      <Skeleton className="h-[14px] w-[20px]" />

      <div className="flex flex-col gap-200 pt-[10px]">
        {/* 세션 / 일반 일정 */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-[6px]">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="size-[6px] rounded-full" />
            <Skeleton className="h-[12px] w-[28px]" />
          </div>
        ))}

        {/* 내 출석 일정만 (divider 구분) */}
        <div className="pt-[2px]">
          <div className="border-line flex items-center gap-[6px] border-t pt-[9px]">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-[12px] w-[70px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { CalendarFilterSkeleton };
