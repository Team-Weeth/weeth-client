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
      className={cn(
        'tablet:pb-20 tablet:px-16 flex flex-col gap-[35px] self-stretch px-450 pt-450',
        className,
      )}
    >
      {/* Page header */}
      <div className="tablet:px-450 flex flex-col gap-200">
        {/* Breadcrumb */}
        <Skeleton className="h-[12px] w-[40px]" />

        {/* Title row */}
        <div className="flex items-center">
          {/* Mobile: YYYY.MM + arrow button + 오늘 */}
          <div className="tablet:hidden flex flex-1 items-center">
            <Skeleton className="h-[36px] w-[84px]" />
            <Skeleton className="mx-200 size-6 rounded-sm" />
            <Skeleton className="h-[32px] w-[42px] rounded-sm" />
          </div>

          {/* Desktop: 캘린더 title + 오늘 */}
          <div className="tablet:flex hidden flex-1 items-center gap-200">
            <Skeleton className="h-[36px] w-[84px]" />
            <Skeleton className="h-[32px] w-[42px] rounded-sm" />
          </div>

          {/* Cardinal dropdown (shared) */}
          <Skeleton className="h-[32px] w-[120px] rounded-sm" />
        </div>
      </div>

      {/* Mobile layout: hidden on tablet+ */}
      <div className="tablet:hidden flex flex-col gap-500">
        {/* Mobile calendar grid */}
        <div>
          {/* Weekday header row */}
          <div className="grid grid-cols-7 pb-100">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex h-7 items-center justify-center">
                <Skeleton className="size-[10px]" />
              </div>
            ))}
          </div>
          {/* Date cells: 5 rows × 7 */}
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="flex h-11 items-center justify-center">
                <Skeleton className="size-7 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="bg-button-neutral h-px w-full shrink-0" />

        {/* Date header + schedule list */}
        <div className="flex flex-col">
          {/* Selected date header */}
          <div className="flex items-center gap-200 py-300">
            <Skeleton className="h-[18px] w-[80px]" />
            <Skeleton className="h-[12px] w-[40px]" />
          </div>

          {/* Schedule items (no date column in mobile) */}
          <div className="flex flex-col gap-300">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-200 py-300">
                <div className="flex flex-col gap-200">
                  <div className="flex items-center gap-[6px]">
                    <Skeleton className="size-[6px] shrink-0 rounded-full" />
                    <Skeleton className="h-[14px] w-[120px]" />
                  </div>
                  <div className="flex gap-100">
                    <Skeleton className="h-[20px] w-[55px] rounded-sm" />
                    <Skeleton className="h-[20px] w-[60px] rounded-sm" />
                  </div>
                </div>
                <Skeleton className="h-[22px] w-[40px] rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop layout: hidden on mobile */}
      <div className="tablet:flex hidden items-start gap-400">
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
