'use client';

import { CalendarMobileGrid } from '@/components/calendar/CalendarMobileGrid';
import { MobileDayScheduleList } from '@/components/calendar/MobileDayScheduleList';
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
      <MobileDayScheduleList
        dateStr={activeDateStr}
        schedules={selectedDateSchedules}
        hasScrolled={hasScrolled}
        listRef={listRef}
        onScroll={onScroll}
        onScheduleClick={onScheduleClick}
        listClassName="pb-700"
      />
    </div>
  );
}

export { CalendarMobileView, type CalendarMobileViewProps };
