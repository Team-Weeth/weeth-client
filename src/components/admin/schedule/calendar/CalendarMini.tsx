'use client';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import ArrowLeftIcon from '@/assets/icons/arrow_left.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import { buildCalendarCells, getCalendarCellColors } from '@/utils/shared/calendar';

interface CalendarMiniProps {
  year: number;
  month: number;
  selectedDate?: string | null;
  /** Dates with a schedule dot indicator */
  eventDates?: Date[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleDate: (dateStr: string) => void;
  className?: string;
}

function CalendarMini({
  year,
  month,
  selectedDate,
  eventDates = [],
  onPrevMonth,
  onNextMonth,
  onToggleDate,
  className,
}: CalendarMiniProps) {
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
    <div
      className={cn(
        'bg-container-neutral flex h-[299px] flex-col items-start rounded-lg px-[17px] pt-400 pb-[10px]',
        className,
      )}
    >
      {/* Header: month text (left) + nav buttons (right) */}
      <div className="flex h-[37px] w-full items-start justify-between">
        <span className="typo-sub1 text-text-normal">
          {year}년 {month}월
        </span>

        <div className="flex gap-200">
          <button
            type="button"
            aria-label="이전 달"
            onClick={onPrevMonth}
            className="bg-container-neutral text-icon-alternative flex size-5 cursor-pointer items-center justify-center rounded-sm"
          >
            <Icon src={ArrowLeftIcon} size={10} className="text-icon-alternative" />
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={onNextMonth}
            className="bg-container-neutral text-icon-alternative flex size-5 cursor-pointer items-center justify-center rounded-sm"
          >
            <Icon src={ArrowRightIcon} size={10} className="text-icon-alternative" />
          </button>
        </div>
      </div>

      {/* Weekday header row */}
      <div className="grid h-[26px] w-full grid-cols-7">
        {DAY_META.map((d, i) => (
          <div
            key={d.en}
            className={cn(
              'typo-body1 flex flex-col items-center self-stretch justify-self-stretch pt-[3px] text-center',
              DAY_HEADER_COLOR[i],
            )}
          >
            {d.ko}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid w-full auto-rows-[35px] grid-cols-7">
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
              onClick={() => cell.isCurrentMonth && onToggleDate(cell.dateStr)}
              className={cn(
                'typo-body1 relative grid cursor-pointer grid-cols-[32px] grid-rows-[35px] place-items-center self-stretch justify-self-stretch rounded-[4px] text-center transition-colors',
                cellBg,
                textColor,
                !cellBg && cell.isCurrentMonth && 'hover:bg-container-neutral-alternative',
                !cell.isCurrentMonth && 'cursor-default',
              )}
            >
              {cell.day}
              {showEvent && (
                <span className="bg-brand-primary absolute top-[28px] left-[14px] size-[4px] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { CalendarMini, type CalendarMiniProps };
