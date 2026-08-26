'use client';

import { cn } from '@/lib/cn';
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
              <svg width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
                <path
                  d="M4.19496 6.30801L1.6083 3.72135L4.19496 1.13468C4.25668 1.07296 4.30564 0.999685 4.33905 0.919043C4.37245 0.8384 4.38964 0.751968 4.38964 0.66468C4.38964 0.577393 4.37245 0.490961 4.33905 0.410318C4.30564 0.329676 4.25668 0.256402 4.19496 0.194681C4.13324 0.132959 4.05997 0.0839992 3.97932 0.0505959C3.89868 0.0171926 3.81225 -6.50338e-10 3.72496 0C3.63768 6.5034e-10 3.55124 0.0171926 3.4706 0.0505959C3.38996 0.0839992 3.31668 0.132959 3.25496 0.194681L0.194963 3.25468C0.13316 3.31636 0.0841287 3.38962 0.0506744 3.47026C0.0172201 3.55091 0 3.63737 0 3.72468C0 3.81199 0.0172201 3.89845 0.0506744 3.9791C0.0841287 4.05975 0.13316 4.133 0.194963 4.19468L3.25496 7.25468C3.51496 7.51468 3.93496 7.51468 4.19496 7.25468C4.4483 6.99468 4.45496 6.56801 4.19496 6.30801Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="다음 달"
              onClick={nextMonth}
              className="text-icon-alternative bg-container-neutral flex size-5 cursor-pointer items-center justify-center rounded-sm"
            >
              <svg width="5" height="8" viewBox="0 0 7 12" fill="none" aria-hidden="true">
                <path
                  d="M0.292021 9.46202L4.17202 5.58202L0.292021 1.70202C0.199439 1.60944 0.125999 1.49953 0.0758943 1.37856C0.0257894 1.2576 9.75511e-10 1.12795 0 0.997021C-9.75506e-10 0.86609 0.0257894 0.736442 0.0758943 0.615478C0.125999 0.494513 0.199439 0.384603 0.292021 0.292021C0.384603 0.199439 0.494513 0.125999 0.615478 0.0758939C0.736442 0.0257889 0.86609 -9.75508e-10 0.997021 0C1.12795 9.7551e-10 1.2576 0.0257889 1.37856 0.0758939C1.49953 0.125999 1.60944 0.199439 1.70202 0.292021L6.29202 4.88202C6.68202 5.27202 6.68202 5.90202 6.29202 6.29202L1.70202 10.882C1.60951 10.9747 1.49962 11.0483 1.37864 11.0985C1.25767 11.1486 1.12799 11.1745 0.997021 11.1745C0.866052 11.1745 0.73637 11.1486 0.615396 11.0985C0.494423 11.0483 0.384534 10.9747 0.292021 10.882C-0.0879792 10.492 -0.0979792 9.85202 0.292021 9.46202Z"
                  fill="currentColor"
                />
              </svg>
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
