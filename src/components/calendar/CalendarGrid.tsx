'use client';

import { cn } from '@/lib/cn';
import { DAY_META } from '@/constants/shared/date';
import { getDaysInMonth, getFirstDayOfMonth } from '@/utils/shared/date';
import { Tag } from '@/components/ui';
import type { TagProps } from '@/components/ui';
import type { CalendarSchedule } from '@/types/calendar';

const MAX_VISIBLE_TAGS = 2;

const SCHEDULE_TAG_VARIANT: Record<string, TagProps['variant']> = {
  SESSION: 'primary',
  EVENT: 'secondary',
};

// 0=Sun, 1=Mon, ..., 6=Sat
const DAY_HEADER_TEXT: string[] = [
  'text-state-error', // Sun
  'text-text-alternative', // Mon
  'text-text-alternative', // Tue
  'text-text-alternative', // Wed
  'text-text-alternative', // Thu
  'text-text-alternative', // Fri
  'text-state-success', // Sat
];

interface CalendarGridProps {
  year: number;
  month: number;
  schedules?: CalendarSchedule[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  className?: string;
}

function CalendarGrid({
  year,
  month,
  schedules = [],
  selectedDate,
  onSelectDate,
  className,
}: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month === 1 ? 12 : month - 1);

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  // Build schedule map: dateStr → CalendarSchedule[]
  const scheduleMap = new Map<string, CalendarSchedule[]>();
  for (const s of schedules) {
    const key = s.start.split('T')[0];
    if (!scheduleMap.has(key)) scheduleMap.set(key, []);
    scheduleMap.get(key)!.push(s);
  }

  type Cell = {
    day: number;
    dateStr: string;
    dayOfWeek: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  };

  const totalRows = Math.ceil((firstDay + daysInMonth) / 7);
  const cellCount = totalRows * 7;

  const cells: Cell[] = Array.from({ length: cellCount }, (_, i) => {
    const dayOfWeek = i % 7;
    if (i < firstDay) {
      const day = prevMonthDays - (firstDay - 1 - i);
      const m = month === 1 ? 12 : month - 1;
      const y = month === 1 ? year - 1 : year;
      return {
        day,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        dayOfWeek,
        isCurrentMonth: false,
        isToday: false,
      };
    } else if (i < firstDay + daysInMonth) {
      const day = i - firstDay + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        day,
        dateStr,
        dayOfWeek,
        isCurrentMonth: true,
        isToday: year === todayYear && month === todayMonth && day === todayDay,
      };
    } else {
      const day = i - firstDay - daysInMonth + 1;
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      return {
        day,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        dayOfWeek,
        isCurrentMonth: false,
        isToday: false,
      };
    }
  });

  return (
    <div className={cn('bg-container-neutral overflow-hidden rounded-md', className)}>
      {/* Weekday header row */}
      <div className="border-line grid grid-cols-[repeat(7,minmax(92px,1fr))] border-b">
        {DAY_META.map((d, i) => (
          <div
            key={d.en}
            className={cn(
              'typo-caption2 flex h-[33px] items-center justify-center',
              DAY_HEADER_TEXT[i],
            )}
          >
            {d.ko}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-[repeat(7,minmax(92px,1fr))]">
        {cells.map((cell, i) => {
          const col = i % 7;
          const row = Math.floor(i / 7);
          const isLastCol = col === 6;
          const isLastRow = row === totalRows - 1;

          const daySchedules = scheduleMap.get(cell.dateStr) ?? [];
          const visibleTags = daySchedules.slice(0, MAX_VISIBLE_TAGS);
          const hiddenCount = daySchedules.length - visibleTags.length;

          const isSelected = selectedDate === cell.dateStr && cell.isCurrentMonth;
          const isTodayHighlighted = cell.isToday && !selectedDate;

          // Date number circle style
          const circleBg = isSelected
            ? 'bg-brand-primary'
            : isTodayHighlighted
              ? 'bg-container-primary'
              : '';

          let dateTextColor: string;
          if (!cell.isCurrentMonth) {
            dateTextColor = 'text-text-disabled';
          } else if (isSelected || isTodayHighlighted) {
            dateTextColor = 'text-text-inverse';
          } else if (cell.dayOfWeek === 0) {
            dateTextColor = 'text-state-error';
          } else if (cell.dayOfWeek === 6) {
            dateTextColor = 'text-state-success';
          } else {
            dateTextColor = 'text-text-normal';
          }

          return (
            <div
              key={`${cell.dateStr}-${i}`}
              className={cn(
                'flex h-[80px] flex-col items-start justify-self-stretch overflow-hidden p-[6px]',
                !isLastRow && 'border-line border-b',
                !isLastCol && 'border-line border-r',
              )}
            >
              {/* Date header row: overflow badge (left) + date number (right) */}
              <div
                className={cn(
                  'flex h-6 w-full shrink-0 items-start',
                  hiddenCount > 0 ? 'justify-between' : 'justify-end',
                )}
              >
                {hiddenCount > 0 && (
                  <span className="typo-caption1 bg-text-disabled/10 text-text-normal rounded-[5px] px-200 py-[2px]">
                    +{hiddenCount}
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`${cell.dateStr}${cell.isToday ? ' (오늘)' : ''}`}
                  aria-pressed={isSelected}
                  disabled={!cell.isCurrentMonth}
                  onClick={() => cell.isCurrentMonth && onSelectDate?.(cell.dateStr)}
                  className={cn(
                    'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-center transition-colors',
                    isTodayHighlighted || isSelected ? 'typo-caption1' : 'typo-caption2',
                    circleBg,
                    dateTextColor,
                    !circleBg && cell.isCurrentMonth && 'hover:bg-container-neutral-alternative',
                    !cell.isCurrentMonth && 'cursor-default',
                  )}
                >
                  {cell.day}
                </button>
              </div>

              {/* Event tags */}
              {visibleTags.length > 0 && (
                <div className="flex w-full flex-col gap-[2px] pt-[4px]">
                  {visibleTags.map((schedule) => (
                    <Tag
                      key={schedule.id}
                      variant={SCHEDULE_TAG_VARIANT[schedule.type] ?? 'primary'}
                      className="flex w-full rounded-[5px] py-[2px]"
                    >
                      <span className="min-w-0 flex-1 truncate">{schedule.title}</span>
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CalendarGrid, type CalendarGridProps };
