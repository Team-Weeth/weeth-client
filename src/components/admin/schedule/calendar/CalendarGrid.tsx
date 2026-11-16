'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import {
  buildCalendarCells,
  buildScheduleMap,
  getCalendarCellColors,
} from '@/utils/shared/calendar';
import { Tag, type TagProps } from '@/components/ui/tag';
import type { ScheduleDetail } from '@/types/calendar';
import { CalendarDayPopup } from '@/components/calendar/CalendarDayPopup';
import { useCalendarGridInteraction } from '@/hooks/admin/useCalendarGridInteraction';

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
  onCrossMonthDateClick?: (dateStr: string, year: number, month: number) => void;
  className?: string;
}

function CalendarGrid({
  year,
  month,
  schedules = [],
  selectedDate,
  onSelectDate,
  onScheduleClick,
  onCrossMonthDateClick,
  className,
}: CalendarGridProps) {
  const cells = buildCalendarCells(year, month);
  const totalRows = cells.length / 7;
  const scheduleMap = buildScheduleMap(schedules, cells);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { isPopupVisible, popupState, handleCellClick, closePopup } = useCalendarGridInteraction({
    wrapperRef,
    selectedDate,
    onSelectDate,
    onCrossMonthDateClick,
  });

  return (
    <div ref={wrapperRef} className={cn('relative h-[636px]', className)}>
      <div className="border-line bg-container-neutral flex h-full flex-col overflow-hidden rounded-[15px] border shadow-sm">
        {/* Weekday header row */}
        <div className="border-line grid shrink-0 grid-cols-[repeat(7,minmax(0,1fr))] border-b">
          {DAY_META.map((d, i) => (
            <div
              key={d.en}
              className={cn(
                'typo-body1 flex h-[33px] items-center justify-center',
                DAY_HEADER_COLOR[i],
              )}
            >
              {d.ko}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid flex-1 auto-rows-fr grid-cols-[repeat(7,minmax(0,1fr))]">
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

            return (
              <div
                key={cell.dateStr}
                data-calendar-cell={cell.dateStr}
                onClick={(e) => handleCellClick(cell, row, col, totalRows, e)}
                className={cn(
                  'flex flex-col items-start justify-self-stretch overflow-hidden pt-300 pr-200 pb-[6px] pl-[6px]',
                  (cell.isCurrentMonth || onCrossMonthDateClick) && 'cursor-pointer',
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
                    className={cn(
                      'typo-caption2 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-center transition-colors',
                      circleBg,
                      dateTextColor,
                      !circleBg && cell.isCurrentMonth && 'hover:bg-container-neutral-alternative',
                      !cell.isCurrentMonth && !onCrossMonthDateClick && 'cursor-default',
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
            schedules={scheduleMap.get(popupState.dateStr) ?? []}
            onClose={closePopup}
            onScheduleClick={(schedule) => {
              closePopup();
              onScheduleClick?.(schedule);
            }}
          />
        </div>
      )}
    </div>
  );
}

export { CalendarGrid, type CalendarGridProps };
