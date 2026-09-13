'use client';

import { cn } from '@/lib/cn';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { CalendarMobileGrid } from '@/components/calendar/CalendarMobileGrid';
import { UpcomingItem } from '@/components/calendar/CalendarUpcomingPanel';
import { formatMobileDateHeader } from '@/utils/shared/date';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarMobileViewProps {
  filteredSchedules: ScheduleDetail[];
  activeDateStr: string;
  selectedDateSchedules: ScheduleDetail[];
  hasScrolled: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onScheduleClick: (schedule: ScheduleDetail) => void;
}

function CalendarMobileView({
  filteredSchedules,
  activeDateStr,
  selectedDateSchedules,
  hasScrolled,
  listRef,
  onScroll,
  onScheduleClick,
}: CalendarMobileViewProps) {
  return (
    <div className="tablet:hidden flex flex-col gap-500">
      <CalendarMobileGrid schedules={filteredSchedules} />
      <div className="bg-button-neutral h-px w-full shrink-0" />
      <div className="flex flex-col">
        <div
          className={cn(
            'relative z-10 -mx-450 flex shrink-0 items-center gap-200 px-450 py-300',
            hasScrolled && 'shadow-date-header [clip-path:inset(0_0_-28px_0)]',
          )}
        >
          <span className="typo-sub1 text-text-normal">
            {formatMobileDateHeader(activeDateStr)}
          </span>
          <span className="typo-caption2 text-text-alternative">
            일정 {selectedDateSchedules.length}개
          </span>
        </div>
        <TooltipProvider>
          <div
            ref={listRef}
            onScroll={onScroll}
            className="flex flex-col gap-300 overflow-y-auto pb-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {selectedDateSchedules.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center gap-300 px-450 pt-800 pb-700">
                <p className="typo-caption2 text-text-alternative text-center">
                  등록된 일정이 없어요
                </p>
              </div>
            ) : (
              selectedDateSchedules.map((schedule) => (
                <UpcomingItem
                  key={schedule.id}
                  schedule={schedule}
                  showDateColumn={false}
                  onScheduleClick={onScheduleClick}
                />
              ))
            )}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

export { CalendarMobileView, type CalendarMobileViewProps };
