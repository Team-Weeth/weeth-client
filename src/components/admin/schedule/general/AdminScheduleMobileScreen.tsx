'use client';

import { useState } from 'react';
import { AdminMobileScheduleView } from '@/components/admin/schedule/general/AdminMobileScheduleView';
import { AdminScheduleBottomBar } from '@/components/admin/schedule/general/AdminScheduleBottomBar';
import { AdminScheduleCreateSheet } from '@/components/admin/schedule/general/AdminScheduleCreateSheet';
import { AdminScheduleMobileDetailView } from '@/components/admin/schedule/general/AdminScheduleMobileDetailView';
import { AdminScheduleMobileSearch } from '@/components/admin/schedule/general/AdminScheduleMobileSearch';
import { AdminScheduleMonthPickerView } from '@/components/admin/schedule/general/AdminScheduleMonthPickerView';
import type { Cardinal } from '@/types/admin/cardinal';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';
import type { ScheduleDetail } from '@/types/calendar';

interface AdminScheduleMobileScreenProps {
  year: number;
  month: number;
  selectedDate: string | null;
  /** 목록에 표시할 날짜(YYYY-MM-DD). 선택한 날짜가 없으면 오늘. */
  activeDateStr: string;
  schedules: ScheduleDetail[];
  selectedDateSchedules: ScheduleDetail[];
  cardinals: Cardinal[];
  activeCardinal?: Cardinal;
  isPending: boolean;
  isError: boolean;
  /** 모바일 상세 화면에 띄울 일정. null이면 캘린더 화면 */
  detailTarget: Schedule | null;
  overviewHref: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onSelectYearMonth: (year: number, month: number) => void;
  onDateClick: (dateStr: string) => void;
  onCardinalSelect: (id: number) => void;
  onCardinalSelectAll: () => void;
  onScheduleClick: (schedule: ScheduleDetail) => void;
  onCloseDetail: () => void;
  onEditDetail: (schedule: Schedule) => void;
  onDeleteDetail: (schedule: Schedule) => void;
  onCreate: (type: ScheduleType) => void;
}

/**
 * 모바일(태블릿 미만) 일정 관리 화면. 캘린더·월 이동·일정 상세 화면을 전환하고
 * 하단 바·일정 추가 시트·검색을 띄운다. 화면 전환용 상태는 이 안에서만 관리한다.
 */
function AdminScheduleMobileScreen({
  year,
  month,
  selectedDate,
  activeDateStr,
  schedules,
  selectedDateSchedules,
  cardinals,
  activeCardinal,
  isPending,
  isError,
  detailTarget,
  overviewHref,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onSelectYearMonth,
  onDateClick,
  onCardinalSelect,
  onCardinalSelectAll,
  onScheduleClick,
  onCloseDetail,
  onEditDetail,
  onDeleteDetail,
  onCreate,
}: AdminScheduleMobileScreenProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  // 월 이동 화면에서 연도만 넘겨볼 때는 캘린더를 바꾸지 않고, 월을 고른 시점에 반영한다.
  const [pickerYear, setPickerYear] = useState(year);

  const showBottomBar = !isMonthPickerOpen && detailTarget === null;

  return (
    // 화면 높이에 고정하고 일정 목록만 내부에서 스크롤한다
    <div className="tablet:hidden h-full overflow-hidden bg-neutral-300">
      {detailTarget ? (
        <AdminScheduleMobileDetailView
          key={detailTarget.id}
          schedule={detailTarget}
          onBack={onCloseDetail}
          onEdit={onEditDetail}
          onDelete={onDeleteDetail}
        />
      ) : isMonthPickerOpen ? (
        <div className="scrollbar-none bg-background h-full overflow-y-auto overscroll-contain">
          <AdminScheduleMonthPickerView
            year={pickerYear}
            selectedMonth={pickerYear === year ? month : null}
            onYearChange={setPickerYear}
            onMonthSelect={(m) => {
              onSelectYearMonth(pickerYear, m);
              setIsMonthPickerOpen(false);
            }}
            onGoToToday={() => {
              onGoToToday();
              setIsMonthPickerOpen(false);
            }}
            onBack={() => setIsMonthPickerOpen(false)}
          />
        </div>
      ) : (
        <AdminMobileScheduleView
          year={year}
          month={month}
          selectedDate={selectedDate}
          activeDateStr={activeDateStr}
          calendarSchedules={schedules}
          selectedDateSchedules={selectedDateSchedules}
          cardinals={cardinals}
          activeCardinal={activeCardinal}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onGoToToday={onGoToToday}
          onOpenMonthPicker={() => {
            setPickerYear(year);
            setIsMonthPickerOpen(true);
          }}
          onDateClick={onDateClick}
          onCardinalSelect={onCardinalSelect}
          onCardinalSelectAll={onCardinalSelectAll}
          onSearchClick={() => setIsSearchOpen(true)}
          onScheduleClick={onScheduleClick}
          isPending={isPending}
          isError={isError}
        />
      )}

      {showBottomBar && (
        <AdminScheduleBottomBar
          overviewHref={overviewHref}
          onCreateClick={() => setIsCreateSheetOpen(true)}
        />
      )}

      <AdminScheduleCreateSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onSelect={onCreate}
      />

      {isSearchOpen && (
        <AdminScheduleMobileSearch
          schedules={schedules}
          onClose={() => setIsSearchOpen(false)}
          onScheduleClick={(schedule) => {
            setIsSearchOpen(false);
            onScheduleClick(schedule);
          }}
        />
      )}
    </div>
  );
}

export { AdminScheduleMobileScreen, type AdminScheduleMobileScreenProps };
