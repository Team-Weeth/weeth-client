'use client';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import { buildCalendarCells, getCalendarCellColors } from '@/utils/shared/calendar';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarActions,
} from '@/stores/useCalendarStore';

interface CalendarMiniProps {
  /** Dates with a schedule dot indicator */
  eventDates?: Date[];
  className?: string;
}

function CalendarMini({ eventDates = [], className }: CalendarMiniProps) {
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { prevMonth, nextMonth, toggleDate } = useCalendarActions();

  const cells = buildCalendarCells(year, month);

  const hasEvent = (cell: (typeof cells)[number]) => {
    if (!cell.isCurrentMonth) return false;
    return eventDates.some(
      (d) =>
        d.getFullYear() === cell.year &&
        d.getMonth() + 1 === cell.month &&
        d.getDate() === cell.day,
    );
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
          {cells.map((cell) => {
            const isSelected = cell.isCurrentMonth && selectedDate === cell.dateStr;
            const isTodayHighlighted = cell.isToday && !selectedDate;
            const showEvent = hasEvent(cell);
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
                onClick={() => cell.isCurrentMonth && toggleDate(cell.dateStr)}
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
                  <span className="bg-brand-primary absolute bottom-[2px] left-1/2 size-[3px] -translate-x-1/2 rounded-full" />
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
