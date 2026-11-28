'use client';

import { cn } from '@/lib/cn';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarMobileGridProps {
  schedules?: ScheduleDetail[];
  className?: string;
}

function CalendarMobileGrid({ schedules, className }: CalendarMobileGridProps) {
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { toggleDate, prevMonth, nextMonth } = useCalendarActions();

  const prevMonthData = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonthData = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  const panels = [
    { ...prevMonthData, schedules: undefined },
    { year, month, schedules },
    { ...nextMonthData, schedules: undefined },
  ];

  const {
    containerRef,
    dragX,
    isTransitioning,
    handleTouchStart,
    handleTouchEnd,
    handleTransitionEnd,
  } = useSwipeNavigation({ onPrev: prevMonth, onNext: nextMonth });

  return (
    <div
      ref={containerRef}
      className={cn('w-full overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Weekday header row — static, not part of the sliding strip */}
      <div className="grid grid-cols-7 pb-100">
        {DAY_META.map((d, i) => (
          <div
            key={d.en}
            className={cn('typo-body2 flex h-7 items-center justify-center', DAY_HEADER_COLOR[i])}
          >
            {d.ko}
          </div>
        ))}
      </div>

      {/*
        3-panel sliding strip.
        Strip is 300% wide; each panel is w-1/3 = 1× container width.
        translateX(-33.333%) centers the middle (current) panel.
        dragX shifts by pixels to reveal prev / next during a swipe.
      */}
      <div
        className="flex w-[300%]"
        style={{
          transform: `translateX(calc(-33.333% + ${dragX}px))`,
          transition: isTransitioning ? 'transform 0.3s ease' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {panels.map((panel) => (
          <div key={`${panel.year}-${panel.month}`} className="w-1/3 shrink-0">
            <MonthGrid
              year={panel.year}
              month={panel.month}
              selectedDate={selectedDate}
              schedules={panel.schedules}
              onDateClick={toggleDate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export { CalendarMobileGrid, type CalendarMobileGridProps };
