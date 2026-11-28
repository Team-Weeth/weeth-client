'use client';

import { cn } from '@/lib/cn';
import { DAY_META, DAY_HEADER_COLOR } from '@/constants/shared/date';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import type { ScheduleDetail } from '@/types/calendar';

interface SwipeableMonthCalendarProps {
  year: number;
  month: number;
  selectedDate: string | null;
  schedules?: ScheduleDetail[];
  onDateClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  className?: string;
}

/**
 * 좌우 스와이프로 월을 넘기는 모바일 월 캘린더. 상태는 갖지 않고 props로만 동작한다.
 * 사용자 캘린더(CalendarMobileGrid)와 어드민 일정 관리(AdminMobileScheduleView)가 함께 쓴다.
 */
function SwipeableMonthCalendar({
  year,
  month,
  selectedDate,
  schedules,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  className,
}: SwipeableMonthCalendarProps) {
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
      {/* Weekday header row — static, not part of the sliding strip */}
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

      {/*
        3-panel sliding strip.
        Strip is 300% wide; each panel is w-1/3 = 1× container width.
        translateX(-33.333%) centers the middle (current) panel.
        dragX shifts by pixels to reveal prev / next during a swipe.
      */}
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

export { SwipeableMonthCalendar, type SwipeableMonthCalendarProps };
