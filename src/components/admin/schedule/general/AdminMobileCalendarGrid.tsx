'use client';

import { cn } from '@/lib/cn';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import type { ScheduleDetail } from '@/types/calendar';

interface AdminMobileCalendarGridProps {
  year: number;
  month: number;
  selectedDate: string | null;
  schedules?: ScheduleDetail[];
  onDateClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  className?: string;
}

function AdminMobileCalendarGrid({
  year,
  month,
  selectedDate,
  schedules,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  className,
}: AdminMobileCalendarGridProps) {
  const prevMonthData = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonthData = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  const panels = [
    { ...prevMonthData, schedules: undefined },
    { year, month, schedules },
    { ...nextMonthData, schedules: undefined },
  ];

  const {
    containerRef,
    dragX,
    isTransitioning,
    handleTouchStart,
    handleTouchEnd,
    handleTransitionEnd,
  } = useSwipeNavigation({ onPrev: onPrevMonth, onNext: onNextMonth });

  return (
    <div
      ref={containerRef}
      className={cn('w-full overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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

      <div
        className="flex w-[300%]"
        style={{
          transform: `translateX(calc(-33.333% + ${dragX}px))`,
          transition: isTransitioning ? 'transform 0.3s ease' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {panels.map((panel) => (
          <div key={`${panel.year}-${panel.month}`} className="w-1/3 shrink-0">
            <MonthGrid
              year={panel.year}
              month={panel.month}
              selectedDate={selectedDate}
              schedules={panel.schedules}
              onDateClick={onDateClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export { AdminMobileCalendarGrid, type AdminMobileCalendarGridProps };
