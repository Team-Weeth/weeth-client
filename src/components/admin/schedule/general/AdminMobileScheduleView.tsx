'use client';

import { cn } from '@/lib/cn';
import { SwipeableMonthCalendar } from '@/components/calendar/SwipeableMonthCalendar';
import { MobileDayScheduleList } from '@/components/calendar/MobileDayScheduleList';
import { AdminScheduleMobileHeader } from '@/components/admin/schedule/general/AdminScheduleMobileHeader';
import { ADMIN_SCHEDULE_BOTTOM_BAR_OFFSET_CLASS } from '@/components/admin/schedule/general/AdminScheduleBottomBar';
import { useScrollableList } from '@/hooks/useScrollableList';
import { toDateInputValue } from '@/utils/shared/date';
import type { ScheduleDetail } from '@/types/calendar';
import type { Cardinal } from '@/types/admin/cardinal';

interface AdminMobileScheduleViewProps {
  year: number;
  month: number;
  selectedDate: string | null;
  /** 목록에 표시할 날짜(YYYY-MM-DD). 선택한 날짜가 없으면 오늘. 부모가 계산해 넘긴다. */
  activeDateStr: string;
  calendarSchedules: ScheduleDetail[];
  selectedDateSchedules: ScheduleDetail[];
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onOpenMonthPicker: () => void;
  onDateClick: (dateStr: string) => void;
  onCardinalSelect: (id: number) => void;
  onCardinalSelectAll: () => void;
  onSearchClick: () => void;
  onScheduleClick: (schedule: ScheduleDetail) => void;
  isPending: boolean;
  isError: boolean;
}

function AdminMobileScheduleView({
  year,
  month,
  selectedDate,
  activeDateStr,
  calendarSchedules,
  selectedDateSchedules,
  cardinals,
  activeCardinal,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onOpenMonthPicker,
  onDateClick,
  onCardinalSelect,
  onCardinalSelectAll,
  onSearchClick,
  onScheduleClick,
  isPending,
  isError,
}: AdminMobileScheduleViewProps) {
  const today = toDateInputValue();
  // 오늘이 아닌 날짜를 선택했거나 다른 달을 보고 있으면 [오늘] 버튼을 노출한다.
  const isViewingToday =
    activeDateStr === today && today.startsWith(`${year}-${String(month).padStart(2, '0')}`);
  // 높이는 flex 레이아웃이 결정한다. 훅은 날짜 변경 시 스크롤 리셋과 헤더 shadow 표시에만 쓴다.
  const { listRef, hasScrolled, onScroll } = useScrollableList(`${year}-${month}-${activeDateStr}`);

  return (
    <div className="flex h-full flex-col gap-500 px-450 pt-400">
      <AdminScheduleMobileHeader
        year={year}
        month={month}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onGoToToday={onGoToToday}
        onOpenMonthPicker={onOpenMonthPicker}
        showTodayButton={!isViewingToday}
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        onCardinalSelect={onCardinalSelect}
        onCardinalSelectAll={onCardinalSelectAll}
        onSearchClick={onSearchClick}
      />

      {isPending ? (
        <div className="bg-container-neutral-alternative h-[300px] animate-pulse rounded-md" />
      ) : isError ? (
        <div className="flex h-[300px] items-center justify-center">
          <span className="typo-body2 text-text-alternative">일정을 불러오지 못했습니다.</span>
        </div>
      ) : (
        <>
          <SwipeableMonthCalendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            schedules={calendarSchedules}
            onDateClick={onDateClick}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
          />

          <div className="bg-button-neutral h-px w-full shrink-0" />

          {/* 날짜 헤더는 고정, 목록만 스크롤. 하단 고정 바(AdminScheduleBottomBar)만큼 여백을 둔다 */}
          <MobileDayScheduleList
            dateStr={activeDateStr}
            schedules={selectedDateSchedules}
            hasScrolled={hasScrolled}
            listRef={listRef}
            onScroll={onScroll}
            onScheduleClick={onScheduleClick}
            className="min-h-0 flex-1"
            listClassName={cn(
              'min-h-0 flex-1 overscroll-contain',
              ADMIN_SCHEDULE_BOTTOM_BAR_OFFSET_CLASS,
            )}
          />
        </>
      )}
    </div>
  );
}

export { AdminMobileScheduleView, type AdminMobileScheduleViewProps };
