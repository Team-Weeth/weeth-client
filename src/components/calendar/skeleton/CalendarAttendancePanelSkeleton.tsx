import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';

function CalendarAttendancePanelSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex shrink-0 flex-col self-stretch rounded-md px-[14px] py-[14px]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-[14px] w-[32px]" />
        <Skeleton className="h-[12px] w-[55px]" />
      </div>

      {/* Percentage + total count */}
      <div className="flex items-end justify-between pt-600">
        <Skeleton className="h-[32px] w-[60px]" />
        <Skeleton className="h-[12px] w-[32px]" />
      </div>

      {/* Progress bar */}
      <div className="pt-200">
        <Skeleton className="h-[6px] w-full rounded-full" />
      </div>
    </div>
  );
}

export { CalendarAttendancePanelSkeleton };
