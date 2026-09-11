import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarMiniSkeleton } from '@/components/calendar/skeleton/CalendarMiniSkeleton';
import { CalendarFilterSkeleton } from '@/components/calendar/skeleton/CalendarFilterSkeleton';
import { CalendarGridSkeleton } from '@/components/calendar/skeleton/CalendarGridSkeleton';
import { CalendarUpcomingPanelSkeleton } from '@/components/calendar/skeleton/CalendarUpcomingPanelSkeleton';
import { CalendarAttendancePanelSkeleton } from '@/components/calendar/skeleton/CalendarAttendancePanelSkeleton';

function CalendarMainSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col gap-[35px] self-stretch px-[64px] pt-450 pb-[80px]', className)}
    >
      {/* Page header */}
      <div className="flex flex-col gap-200 px-450">
        {/* Breadcrumb */}
        <Skeleton className="h-[12px] w-[40px]" />

        {/* Title row: h2 + 오늘 button + cardinal dropdown */}
        <div className="flex items-center">
          <div className="flex flex-1 items-center gap-200">
            <Skeleton className="h-[36px] w-[84px]" />
            <Skeleton className="h-[32px] w-[42px] rounded-sm" />
          </div>
          <Skeleton className="h-[32px] w-[120px] rounded-sm" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-start gap-400">
        {/* Left column: mini calendar + filter */}
        <div className="flex flex-col gap-300">
          <CalendarMiniSkeleton />
          <CalendarFilterSkeleton />
        </div>

        {/* Right column: grid + side panels */}
        <div className="flex flex-1 items-start gap-400">
          <CalendarGridSkeleton className="min-w-0 flex-1" />
          <div className="desktop:flex hidden flex-col gap-300">
            <CalendarUpcomingPanelSkeleton />
            <CalendarAttendancePanelSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export { CalendarMainSkeleton };
