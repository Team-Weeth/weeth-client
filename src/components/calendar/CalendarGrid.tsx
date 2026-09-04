'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import { buildCalendarCells, getCalendarCellColors } from '@/utils/shared/calendar';
import { Tag, type TagProps } from '@/components/ui/tag';
import type { ScheduleDetail } from '@/types/calendar';
import { CalendarDayPopup } from '@/components/calendar/CalendarDayPopup';
import { useCalendarDayPopup } from '@/components/calendar/useCalendarDayPopup';

const MAX_VISIBLE_TAGS = 2;

const SCHEDULE_TAG_VARIANT: Record<string, TagProps['variant']> = {
  SESSION: 'primary',
  EVENT: 'secondary',
};

interface CalendarGridProps {
  year: number;
  month: number;
  schedules?: ScheduleDetail[];
  selectedDate?: string | null;
  onSelectDate?: (date: string) => void;
  onScheduleClick?: (schedule: ScheduleDetail) => void;
  className?: string;
}

function CalendarGrid({
  year,
  month,
  schedules = [],
  selectedDate,
  onSelectDate,
  onScheduleClick,
  className,
}: CalendarGridProps) {
  const cells = buildCalendarCells(year, month);
  const totalRows = cells.length / 7;

  const scheduleMap = new Map<string, ScheduleDetail[]>();
  for (const s of schedules) {
    const key = s.start.split('T')[0];
    if (!scheduleMap.has(key)) scheduleMap.set(key, []);
    scheduleMap.get(key)?.push(s);
  }

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isPopupVisible, popupState, openPopup, closePopup } = useCalendarDayPopup(
    wrapperRef,
    selectedDate,
  );

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="bg-container-neutral overflow-hidden rounded-md">
        {/* Weekday header row */}
        <div className="border-line grid grid-cols-[repeat(7,minmax(92px,1fr))] border-b">
          {DAY_META.map((d, i) => (
            <div
              key={d.en}
              className={cn(
                'typo-caption2 flex h-[33px] items-center justify-center',
                DAY_HEADER_COLOR[i],
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
            const { bg: circleBg, text: dateTextColor } = getCalendarCellColors(
              cell.isCurrentMonth,
              isSelected,
              isTodayHighlighted,
              cell.dayOfWeek,
            );

            const handleCellClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              if (!cell.isCurrentMonth) return;

              const isDeselect = selectedDate === cell.dateStr;
              onSelectDate?.(cell.dateStr);

              if (isDeselect) {
                closePopup();
                return;
              }

              const wrapper = wrapperRef.current;
              const cellEl = (e.currentTarget as HTMLElement).closest(
                '[data-calendar-cell]',
              ) as HTMLElement | null;

              if (wrapper && cellEl) {
                const [, m, d] = cell.dateStr.split('-');
                openPopup({
                  dateStr: cell.dateStr,
                  formattedDate: `${Number(m)}월 ${Number(d)}일`,
                  schedules: daySchedules,
                  row,
                  col,
                  totalRows,
                  wRect: wrapper.getBoundingClientRect(),
                  cRect: cellEl.getBoundingClientRect(),
                });
              }
            };

            return (
              <div
                key={cell.dateStr}
                data-calendar-cell={cell.dateStr}
                className={cn(
                  'flex h-[80px] flex-col items-start justify-self-stretch overflow-hidden p-[6px]',
                  !isLastRow && 'border-line border-b',
                  !isLastCol && 'border-line border-r',
                )}
              >
                {/* Date header: overflow badge (left) + date number (right) */}
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
                    onClick={handleCellClick}
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

      {/* Day popup */}
      {isPopupVisible && popupState && (
        <div
          className="absolute z-10"
          style={{
            top: popupState.top,
            bottom: popupState.bottom,
            left: popupState.left,
            right: popupState.right,
          }}
        >
          <CalendarDayPopup
            date={popupState.formattedDate}
            schedules={popupState.schedules}
            onClose={closePopup}
            onScheduleClick={onScheduleClick}
          />
        </div>
      )}
    </div>
  );
}

export { CalendarGrid, type CalendarGridProps };
