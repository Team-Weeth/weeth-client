'use client';

import { cn } from '@/lib/cn';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import { SCHEDULE_DOT_COLOR } from '@/constants/calendar';
import { buildCalendarCells, getCalendarCellColors } from '@/utils/shared/calendar';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarMobileGridProps {
  schedules?: ScheduleDetail[];
  className?: string;
}

interface MonthGridProps {
  year: number;
  month: number;
  selectedDate: string | null;
  schedules?: ScheduleDetail[];
  onDateClick: (dateStr: string) => void;
}

function MonthGrid({ year, month, selectedDate, schedules, onDateClick }: MonthGridProps) {
  const cells = buildCalendarCells(year, month);

  const getScheduleDots = (cell: (typeof cells)[number]): string[] => {
    if (!cell.isCurrentMonth || !schedules) return [];
    const daySchedules = schedules.filter((s) => s.start.startsWith(cell.dateStr));
    const dots: string[] = [];
    if (daySchedules.some((s) => s.type === 'SESSION')) dots.push(SCHEDULE_DOT_COLOR.SESSION);
    if (daySchedules.some((s) => s.type === 'EVENT')) dots.push(SCHEDULE_DOT_COLOR.EVENT);
    return dots;
  };

  return (
    <div className="grid grid-cols-7 gap-y-200">
      {cells.map((cell) => {
        const isSelected = cell.isCurrentMonth && selectedDate === cell.dateStr;
        const isTodayHighlighted = cell.isToday && !selectedDate;
        const dots = getScheduleDots(cell);
        const { bg: cellBg, text: textColor } = getCalendarCellColors(
          cell.isCurrentMonth,
          isSelected,
          isTodayHighlighted,
          cell.dayOfWeek,
        );

        return (
          <button
            key={cell.dateStr}
            type="button"
            aria-label={`${cell.dateStr}${cell.isToday ? ' (오늘)' : ''}`}
            aria-pressed={isSelected}
            disabled={!cell.isCurrentMonth}
            onClick={() => cell.isCurrentMonth && onDateClick(cell.dateStr)}
            className={cn(
              'flex h-11 flex-col items-center justify-center gap-[3px]',
              cell.isCurrentMonth ? 'cursor-pointer' : 'cursor-default',
            )}
          >
            <span
              className={cn(
                'typo-button2 flex size-7 items-center justify-center rounded-full transition-colors',
                cellBg,
                textColor,
                !cellBg && cell.isCurrentMonth && 'hover:bg-container-neutral-alternative',
              )}
            >
              {cell.day}
            </span>
            {dots.length > 0 && (
              <div className="flex items-center gap-[2px]">
                {dots.map((dotColor) => (
                  <span key={dotColor} className={cn('size-[4px] rounded-full', dotColor)} />
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CalendarMobileGrid({ schedules, className }: CalendarMobileGridProps) {
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { toggleDate, prevMonth, nextMonth } = useCalendarActions();

  const prevMonthData = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonthData = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  const {
    containerRef,
    dragX,
    isTransitioning,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTransitionEnd,
  } = useSwipeNavigation({ onPrev: prevMonth, onNext: nextMonth });

  return (
    <div
      ref={containerRef}
      className={cn('w-full overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
        {/* Previous month */}
        <div className="w-1/3 shrink-0">
          <MonthGrid
            year={prevMonthData.year}
            month={prevMonthData.month}
            selectedDate={selectedDate}
            onDateClick={toggleDate}
          />
        </div>

        {/* Current month */}
        <div className="w-1/3 shrink-0">
          <MonthGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            schedules={schedules}
            onDateClick={toggleDate}
          />
        </div>

        {/* Next month */}
        <div className="w-1/3 shrink-0">
          <MonthGrid
            year={nextMonthData.year}
            month={nextMonthData.month}
            selectedDate={selectedDate}
            onDateClick={toggleDate}
          />
        </div>
      </div>
    </div>
  );
}

export { CalendarMobileGrid, type CalendarMobileGridProps };
