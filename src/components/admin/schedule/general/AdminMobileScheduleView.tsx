'use client';

import { cn } from '@/lib/cn';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { AdminMobileCalendarGrid } from '@/components/admin/schedule/general/AdminMobileCalendarGrid';
import { AdminScheduleMobileHeader } from '@/components/admin/schedule/general/AdminScheduleMobileHeader';
import { UpcomingItem } from '@/components/calendar/CalendarUpcomingPanel';
import { useScrollableList } from '@/hooks/useScrollableList';
import { formatMobileDateHeader } from '@/utils/shared/date';
import type { ScheduleDetail } from '@/types/calendar';
import type { Cardinal } from '@/types/admin/cardinal';

interface AdminMobileScheduleViewProps {
  year: number;
  month: number;
  selectedDate: string | null;
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
  const today = todayStr();
  const activeDateStr = selectedDate ?? today;
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
          <AdminMobileCalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            schedules={calendarSchedules}
            onDateClick={onDateClick}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
          />

          <div className="bg-button-neutral h-px w-full shrink-0" />

          <div className="flex min-h-0 flex-1 flex-col">
            {/* Date header — 고정 */}
            <div
              className={cn(
                'relative z-10 -mx-450 flex shrink-0 items-center gap-200 px-450 py-300',
                hasScrolled && 'shadow-date-header [clip-path:inset(0_0_-28px_0)]',
              )}
            >
              <span className="typo-sub1 text-text-normal">
                {formatMobileDateHeader(activeDateStr)}
              </span>
              <span className="typo-caption2 text-text-alternative">
                일정 {selectedDateSchedules.length}개
              </span>
            </div>

            {/* Schedule list — 이 영역만 스크롤. 하단 고정 바(AdminScheduleBottomBar)만큼 여백을 둔다 */}
            <TooltipProvider>
              <div
                ref={listRef}
                onScroll={onScroll}
                className="scrollbar-none flex min-h-0 flex-1 flex-col gap-300 overflow-y-auto overscroll-contain pb-[120px]"
              >
                {selectedDateSchedules.length === 0 ? (
                  <div className="flex w-full flex-col items-center justify-center pt-800 pb-700">
                    <p className="typo-body2 text-text-alternative text-center">
                      등록된 일정이 없어요
                    </p>
                  </div>
                ) : (
                  selectedDateSchedules.map((schedule) => (
                    <UpcomingItem
                      key={schedule.id}
                      schedule={schedule}
                      showDateColumn={false}
                      onScheduleClick={onScheduleClick}
                    />
                  ))
                )}
              </div>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export { AdminMobileScheduleView, type AdminMobileScheduleViewProps };
