'use client';

import { cn } from '@/lib/cn';
import { SCHEDULE_DOT_COLOR } from '@/constants/calendar';
import { buildCalendarCells, getCalendarCellColors } from '@/utils/shared/calendar';
import type { ScheduleDetail } from '@/types/calendar';

interface MonthGridProps {
  year: number;
  month: number;
  selectedDate: string | null;
  schedules?: ScheduleDetail[];
  onDateClick: (dateStr: string) => void;
}

function MonthGrid({ year, month, selectedDate, schedules, onDateClick }: MonthGridProps) {
  const cells = buildCalendarCells(year, month);

  const scheduleTypesByDate = new Map<string, Set<ScheduleDetail['type']>>();
  for (const schedule of schedules ?? []) {
    const date = schedule.start.slice(0, 10);
    const types = scheduleTypesByDate.get(date) ?? new Set<ScheduleDetail['type']>();
    types.add(schedule.type);
    scheduleTypesByDate.set(date, types);
  }

  // 점은 색으로만 구분되므로, 같은 정보를 날짜 버튼의 접근성 라벨에도 담는다.
  const getScheduleDots = (cell: (typeof cells)[number]): { color: string; label: string }[] => {
    if (!cell.isCurrentMonth) return [];
    const types = scheduleTypesByDate.get(cell.dateStr);
    const dots: { color: string; label: string }[] = [];
    if (types?.has('SESSION')) dots.push({ color: SCHEDULE_DOT_COLOR.SESSION, label: '세션' });
    if (types?.has('EVENT')) dots.push({ color: SCHEDULE_DOT_COLOR.EVENT, label: '일반 일정' });
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
            aria-label={`${cell.dateStr}${cell.isToday ? ' (오늘)' : ''}${
              dots.length > 0 ? `, ${dots.map((dot) => dot.label).join('·')} 있음` : ''
            }`}
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
            <div className="flex h-[4px] items-center gap-[2px]">
              {dots.map((dot) => (
                <span key={dot.label} className={cn('size-[4px] rounded-full', dot.color)} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { MonthGrid, type MonthGridProps };
