'use client';

import { cn } from '@/lib/cn';
import { Checkbox } from '@/components/ui/Checkbox';
import { useCalendarFilters, useCalendarActions } from '@/stores/useCalendarStore';

interface CalendarFilterProps {
  className?: string;
}

function CalendarFilter({ className }: CalendarFilterProps) {
  const { sessionEnabled, eventEnabled, attendanceOnly } = useCalendarFilters();
  const { toggleSession, toggleEvent, toggleAttendance } = useCalendarActions();

  return (
    <div className={cn('bg-container-neutral w-[195px] rounded-md p-300', className)}>
      <span className="typo-caption1 text-text-normal">필터</span>

      <div className="flex flex-col gap-200 pt-[10px]">
        {/* 세션 */}
        <label className="flex cursor-pointer items-center gap-[6px]">
          <Checkbox checked={sessionEnabled} onCheckedChange={() => toggleSession()} />
          <span className="bg-brand-primary size-[6px] shrink-0 rounded-full" />
          <span className="typo-caption2 text-text-normal">세션</span>
        </label>

        {/* 일반 일정 */}
        <label className="flex cursor-pointer items-center gap-[6px]">
          <Checkbox checked={eventEnabled} onCheckedChange={() => toggleEvent()} />
          <span className="bg-state-success size-[6px] shrink-0 rounded-full" />
          <span className="typo-caption2 text-text-normal">일반 일정</span>
        </label>

        {/* 내 출석 일정만 — divider 구분 */}
        <div className="pt-[2px]">
          <label className="border-line flex cursor-pointer items-center gap-[6px] border-t pt-[9px]">
            <Checkbox checked={attendanceOnly} onCheckedChange={() => toggleAttendance()} />
            <span className="typo-caption2 text-text-normal">내 출석 일정만</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export { CalendarFilter, type CalendarFilterProps };
