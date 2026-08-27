'use client';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons';
import { DAY_META } from '@/constants/shared/date';
import { getDaysInMonth, getFirstDayOfMonth } from '@/utils/shared/date';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarActions,
} from '@/stores/useCalendarStore';

const DAY_HEADER_COLOR: string[] = [
  'text-state-error',
  'text-text-alternative',
  'text-text-alternative',
  'text-text-alternative',
  'text-text-alternative',
  'text-text-alternative',
  'text-state-success',
];

interface CalendarMiniProps {
  /** Dates with a schedule dot indicator */
  eventDates?: Date[];
  className?: string;
}

type Cell = {
  day: number;
  year: number;
  month: number;
  dayOfWeek: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function CalendarMini({ eventDates = [], className }: CalendarMiniProps) {
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { prevMonth, nextMonth, toggleDate } = useCalendarActions();

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month === 1 ? 12 : month - 1);
  const totalRows = Math.ceil((firstDay + daysInMonth) / 7);
  const cellCount = totalRows * 7;

  const cells: Cell[] = Array.from({ length: cellCount }, (_, i) => {
    const dayOfWeek = i % 7;
    if (i < firstDay) {
      const day = prevMonthDays - (firstDay - 1 - i);
      const m = month === 1 ? 12 : month - 1;
      const y = month === 1 ? year - 1 : year;
      return { day, year: y, month: m, dayOfWeek, isCurrentMonth: false, isToday: false };
    } else if (i < firstDay + daysInMonth) {
      const day = i - firstDay + 1;
      const isToday = year === todayYear && month === todayMonth && day === todayDay;
      return { day, year, month, dayOfWeek, isCurrentMonth: true, isToday };
    } else {
      const day = i - firstDay - daysInMonth + 1;
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      return { day, year: y, month: m, dayOfWeek, isCurrentMonth: false, isToday: false };
    }
  });

  const isSelected = (cell: Cell) => {
    if (!selectedDate || !cell.isCurrentMonth) return false;
    return (
      selectedDate ===
      `${cell.year}-${String(cell.month).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
    );
  };

  const hasEvent = (cell: Cell) => {
    if (!cell.isCurrentMonth) return false;
    return eventDates.some(
      (d) =>
        d.getFullYear() === cell.year &&
        d.getMonth() + 1 === cell.month &&
        d.getDate() === cell.day,
    );
  };

  const handleSelectDate = (cell: Cell) => {
    if (!cell.isCurrentMonth) return;
    const dateStr = `${cell.year}-${String(cell.month).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
    toggleDate(dateStr);
  };

  return (
    <div className={cn('bg-container-neutral w-[195px] overflow-hidden rounded-md', className)}>
      {/* Inner padding wrapper: 12px top, 14px sides, 8px bottom */}
      <div className="flex flex-col px-[14px] pt-300 pb-200">
        {/* Header: month text (left) + nav buttons (right) */}
        <div className="flex items-center justify-between pb-[8px]">
          <span className="typo-caption2 text-text-normal">
            {year}년 {month}월
          </span>

          <div className="flex gap-200">
            <button
              type="button"
              aria-label="이전 달"
              onClick={prevMonth}
              className="text-icon-alternative bg-container-neutral flex size-5 cursor-pointer items-center justify-center rounded-sm"
            >
              <Icon src={ArrowLeftIcon} size={8} className="text-icon-alternative" />
            </button>
            <button
              type="button"
              aria-label="다음 달"
              onClick={nextMonth}
              className="text-icon-alternative bg-container-neutral flex size-5 cursor-pointer items-center justify-center rounded-sm"
            >
              <Icon src={ArrowRightIcon} size={8} className="text-icon-alternative" />
            </button>
          </div>
        </div>

        {/* Weekday header row */}
        <div className="grid grid-cols-7">
          {DAY_META.map((d, i) => (
            <div
              key={d.en}
              className={cn(
                'typo-caption2 flex h-[18px] w-6 flex-col items-center py-[2px] text-center',
                DAY_HEADER_COLOR[i],
              )}
            >
              {d.ko}
            </div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const selected = isSelected(cell);
            const showEvent = hasEvent(cell);
            const isTodayHighlighted = cell.isToday && !selectedDate;

            const cellBg = selected
              ? 'bg-brand-primary'
              : isTodayHighlighted
                ? 'bg-container-primary'
                : '';

            let textColor: string;
            if (!cell.isCurrentMonth) {
              textColor = 'text-text-disabled';
            } else if (selected || isTodayHighlighted) {
              textColor = 'text-text-inverse';
            } else if (cell.dayOfWeek === 0) {
              textColor = 'text-state-error';
            } else if (cell.dayOfWeek === 6) {
              textColor = 'text-state-success';
            } else {
              textColor = 'text-text-normal';
            }

            return (
              <button
                key={`${cell.year}-${cell.month}-${cell.day}-${i}`}
                type="button"
                aria-label={`${cell.year}-${String(cell.month).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}${cell.isToday ? ' (오늘)' : ''}`}
                aria-pressed={selected}
                disabled={!cell.isCurrentMonth}
                onClick={() => handleSelectDate(cell)}
                className={cn(
                  'typo-caption2 relative flex h-[26px] w-6 cursor-pointer flex-col items-center justify-center justify-self-start rounded-[4px] text-center transition-colors',
                  cellBg,
                  textColor,
                  !cellBg && cell.isCurrentMonth && 'hover:bg-container-neutral-alternative',
                  !cell.isCurrentMonth && 'cursor-default',
                )}
              >
                {cell.day}
                {showEvent && (
                  <span className="bg-brand-primary absolute bottom-[1.336px] left-[10.43px] size-[3px] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { CalendarMini, type CalendarMiniProps };
