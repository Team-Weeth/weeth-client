'use client';

import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import { SwipeableMonthCalendar } from '@/components/calendar/SwipeableMonthCalendar';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarMobileGridProps {
  schedules?: ScheduleDetail[];
  className?: string;
}

/** 사용자 캘린더 스토어를 SwipeableMonthCalendar에 연결한다. */
function CalendarMobileGrid({ schedules, className }: CalendarMobileGridProps) {
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { toggleDate, prevMonth, nextMonth } = useCalendarActions();

  return (
    <SwipeableMonthCalendar
      year={year}
      month={month}
      selectedDate={selectedDate}
      schedules={schedules}
      onDateClick={toggleDate}
      onPrevMonth={prevMonth}
      onNextMonth={nextMonth}
      className={className}
    />
  );
}

export { CalendarMobileGrid, type CalendarMobileGridProps };
