'use client';

import { cn } from '@/lib/cn';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { UpcomingItem } from '@/components/calendar/CalendarUpcomingPanel';
import { formatMobileDateHeader } from '@/utils/shared/date';
import type { ScheduleDetail } from '@/types/calendar';

interface MobileDayScheduleListProps {
  /** YYYY-MM-DD */
  dateStr: string;
  schedules: ScheduleDetail[];
  /** 목록이 스크롤되면 날짜 헤더에 shadow를 띄운다 (useScrollableList). */
  hasScrolled: boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  onScheduleClick: (schedule: ScheduleDetail) => void;
  /** 바깥 래퍼 (높이 배분 등) */
  className?: string;
  /** 스크롤 목록 (하단 여백 등 화면별 차이) */
  listClassName?: string;
}

/**
 * 모바일 캘린더 하단의 [선택 날짜 헤더 + 그날 일정 목록]. 헤더는 고정, 목록만 스크롤한다.
 * 사용자 캘린더(CalendarMobileView)와 어드민 일정 관리(AdminMobileScheduleView)가 함께 쓴다.
 */
function MobileDayScheduleList({
  dateStr,
  schedules,
  hasScrolled,
  listRef,
  onScroll,
  onScheduleClick,
  className,
  listClassName,
}: MobileDayScheduleListProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div
        className={cn(
          'relative z-10 -mx-450 flex shrink-0 items-center gap-200 px-450 py-300',
          hasScrolled && 'shadow-date-header [clip-path:inset(0_0_-28px_0)]',
        )}
      >
        <span className="typo-sub1 text-text-normal">{formatMobileDateHeader(dateStr)}</span>
        <span className="typo-caption2 text-text-alternative">일정 {schedules.length}개</span>
      </div>
      <TooltipProvider>
        <div
          ref={listRef}
          onScroll={onScroll}
          className={cn('scrollbar-none flex flex-col gap-300 overflow-y-auto', listClassName)}
        >
          {schedules.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center gap-300 px-450 pt-800 pb-700">
              <p className="typo-body2 text-text-alternative text-center">등록된 일정이 없어요</p>
            </div>
          ) : (
            schedules.map((schedule) => (
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
  );
}

export { MobileDayScheduleList, type MobileDayScheduleListProps };
