'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useScrollableList } from '@/hooks/useScrollableList';
import { useIsTablet } from '@/hooks/useIsTablet';
import { CalendarFilter } from '@/components/calendar/CalendarFilter';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarMini } from '@/components/calendar/CalendarMini';
import { CalendarMobileGrid } from '@/components/calendar/CalendarMobileGrid';
import { CalendarMonthPicker } from '@/components/calendar/CalendarMonthPicker';
import { CalendarUpcomingPanel, UpcomingItem } from '@/components/calendar/CalendarUpcomingPanel';
import { CalendarAttendancePanel } from '@/components/calendar/CalendarAttendancePanel';
import { CalendarScheduleDetailContentMobile } from '@/components/calendar/CalendarScheduleDetailContentMobile';
import { CalendarAttendeeListContent } from '@/components/calendar/CalendarAttendeeListContent';
import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarFilters,
  useCalendarMonthPickerOpen,
  useCalendarAttendeeListOpen,
  useCalendarSelectedSchedule,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import { useClubId } from '@/stores';
import { CalendarScheduleModal } from '@/components/calendar/CalendarScheduleModal';
import { computeDDay, formatMobileDateHeader, toDateInputValue } from '@/utils/shared/date';
import { scheduleApi } from '@/lib/apis/schedule';
import { scheduleQueryKeys } from '@/hooks/queries/schedule/scheduleQueryKeys';
import { useMonthlySchedulesQuery } from '@/hooks/queries/schedule/useScheduleQueries';
import { toBaseUiSchedule, toUiScheduleDetail } from '@/components/calendar/calendarScheduleMapper';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarMainProps {
  className?: string;
}

function CalendarMain({ className }: CalendarMainProps) {
  const clubId = useClubId();
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { sessionEnabled, eventEnabled, attendanceOnly } = useCalendarFilters();
  const monthPickerOpen = useCalendarMonthPickerOpen();
  const attendeeListOpen = useCalendarAttendeeListOpen();
  const selectedSchedule = useCalendarSelectedSchedule();
  const {
    toggleDate,
    goToYearMonth,
    goToYearMonthDate,
    openMonthPicker,
    closeMonthPicker,
    openScheduleDetail,
    closeScheduleDetail,
    openAttendeeList,
    closeAttendeeList,
    reset,
  } = useCalendarActions();

  const isTablet = useIsTablet();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });

  const [pickerYear, setPickerYear] = useState(year);

  // 월별 일정 목록
  const { data: rawSchedules = [] } = useMonthlySchedulesQuery(
    year,
    month,
    activeCardinal?.cardinalNumber,
  );

  // 선택된 일정의 상세 정보 — selectedSchedule이 있을 때만 fetch
  const { data: apiDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: scheduleQueryKeys.detail(
      clubId,
      selectedSchedule?.id ?? null,
      selectedSchedule?.type ?? null,
    ),
    queryFn: () =>
      scheduleApi
        .getDetail(clubId!, selectedSchedule!.id, selectedSchedule!.type)
        .then((res) => res.data.data),
    enabled: !!clubId && selectedSchedule !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 상세 데이터가 오면 풍부한 UI 타입으로 변환, 로딩 중에는 기본 목록 데이터 사용
  const fullDetail = apiDetail ? toUiScheduleDetail(apiDetail, clubId) : selectedSchedule;

  useEffect(() => {
    if (!monthPickerOpen) return;
    const mql = window.matchMedia('(min-width: 696px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) closeMonthPicker();
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [monthPickerOpen, closeMonthPicker]);

  // 페이지 이탈 시 헤더 오버레이 상태 초기화
  useEffect(() => {
    return () => {
      closeScheduleDetail();
      closeMonthPicker();
    };
  }, [closeScheduleDetail, closeMonthPicker]);

  // 딥링크: 마운트 시 URL 파라미터로 일정 상세 자동 오픈
  useEffect(() => {
    const idParam = searchParams.get('id');
    const typeParam = searchParams.get('type');
    if (idParam && (typeParam === 'SESSION' || typeParam === 'EVENT')) {
      openScheduleDetail({ id: Number(idParam), type: typeParam, title: '', start: '', end: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildUrlWithoutSchedule = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    params.delete('type');
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const handleOpenScheduleDetail = (schedule: ScheduleDetail) => {
    openScheduleDetail(schedule);
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', String(schedule.id));
    params.set('type', schedule.type);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleCloseScheduleDetail = () => {
    closeScheduleDetail();
    router.replace(buildUrlWithoutSchedule());
  };

  const handleReset = () => {
    reset();
    router.replace(buildUrlWithoutSchedule());
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleOpenMonthPicker = () => {
    setPickerYear(year);
    openMonthPicker();
  };

  const schedules = rawSchedules.map(toBaseUiSchedule);

  const filteredSchedules = schedules.filter((s) => {
    if (attendanceOnly) return s.type === 'SESSION';
    if (s.type === 'SESSION' && !sessionEnabled) return false;
    if (s.type === 'EVENT' && !eventEnabled) return false;
    return true;
  });

  const eventDates = filteredSchedules.map((s) => new Date(s.start));

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const activeDateStr =
    selectedDate ??
    (isCurrentMonth ? toDateInputValue(now) : `${year}-${String(month).padStart(2, '0')}-01`);
  const selectedDateSchedules = filteredSchedules.filter((s) => s.start.startsWith(activeDateStr));

  const scrollKey = `${year}-${month}-${activeDateStr}`;
  const { listRef, hasScrolled, onScroll } = useScrollableList(scrollKey);

  const handleScheduleClick = (schedule: ScheduleDetail) => {
    handleOpenScheduleDetail(schedule);
  };

  return (
    <div
      className={cn(
        'flex flex-col self-stretch',
        monthPickerOpen ? 'tablet:hidden' : 'tablet:pb-20 tablet:px-16 gap-8.75 px-450 pt-450',
        className,
      )}
    >
      {monthPickerOpen ? (
        /* Month picker — replaces calendar content on mobile; Header shows "월 이동" nav */
        <CalendarMonthPicker
          year={pickerYear}
          selectedMonth={month}
          className="pt-0"
          onMonthSelect={(m) => {
            goToYearMonth(pickerYear, m);
            closeMonthPicker();
          }}
          onYearChange={setPickerYear}
          onGoToToday={() => {
            handleReset();
            closeMonthPicker();
          }}
        />
      ) : (
        <>
          {/* Page header */}
          <div className="tablet:px-450 flex flex-col gap-200">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="typo-caption1 text-text-alternative">
                    캘린더
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center">
              {/* Mobile: YYYY.MM + 달 선택 버튼 */}
              <div className="tablet:hidden flex flex-1 items-center">
                <h2 className="typo-h2 text-text-normal">
                  {year}.{String(month).padStart(2, '0')}
                </h2>
                <button
                  type="button"
                  aria-label="달 선택"
                  onClick={handleOpenMonthPicker}
                  className="flex cursor-pointer items-center justify-center rounded-sm p-200"
                >
                  <Icon src={ArrowDownIcon} size={24} className="text-icon-normal" />
                </button>
                <Button
                  variant="outlined"
                  size="sm"
                  className="typo-caption1"
                  onClick={handleReset}
                >
                  오늘
                </Button>
              </div>

              {/* Desktop: 캘린더 title + 오늘 button */}
              <div className="tablet:flex hidden flex-1 items-center gap-200">
                <h2 className="typo-h2 text-text-normal">캘린더</h2>
                <Button variant="outlined" size="sm" onClick={handleReset}>
                  오늘
                </Button>
              </div>

              <CardinalDropdown
                cardinals={cardinals}
                activeCardinal={activeCardinal}
                onSelect={setSelectedCardinalId}
              />
            </div>
          </div>

          {/* Mobile layout: hidden on tablet+ */}
          <div className="tablet:hidden flex flex-col gap-500">
            <CalendarMobileGrid schedules={filteredSchedules} />

            {/* Divider */}
            <div className="bg-button-neutral h-px w-full shrink-0" />

            {/* Date header + list: grouped so gap-500 doesn't bleed between them */}
            <div className="flex flex-col">
              {/* Selected date header — full-width shadow only at the bottom, shown when list is scrollable */}
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

              {/* Scrollable schedule list — fills remaining height, no visible scrollbar */}
              <TooltipProvider>
                <div
                  ref={listRef}
                  onScroll={onScroll}
                  className="flex flex-col gap-300 overflow-y-auto pb-700 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {selectedDateSchedules.length === 0 ? (
                    <div className="flex w-full flex-col items-center justify-center gap-300 px-450 pt-800 pb-700">
                      <p className="typo-caption2 text-text-alternative text-center">
                        등록된 일정이 없어요
                      </p>
                    </div>
                  ) : (
                    selectedDateSchedules.map((schedule) => (
                      <UpcomingItem
                        key={schedule.id}
                        schedule={schedule}
                        showDateColumn={false}
                        onScheduleClick={handleScheduleClick}
                      />
                    ))
                  )}
                </div>
              </TooltipProvider>
            </div>
          </div>

          {/* Desktop layout: hidden on mobile */}
          <div className="tablet:flex hidden items-start gap-400">
            {/* Left column */}
            <div className="flex flex-col gap-300">
              <CalendarMini eventDates={eventDates} />
              <CalendarFilter />
            </div>

            {/* Right column */}
            <div className="flex flex-1 items-start gap-400">
              <CalendarGrid
                year={year}
                month={month}
                schedules={filteredSchedules}
                selectedDate={selectedDate}
                onSelectDate={toggleDate}
                onScheduleClick={handleScheduleClick}
                onCrossMonthDateClick={(dateStr, y, m) => goToYearMonthDate(y, m, dateStr)}
                className="min-w-0 flex-1"
              />
              <div className="desktop:flex hidden flex-col gap-300">
                <CalendarUpcomingPanel
                  schedules={filteredSchedules}
                  onScheduleClick={handleScheduleClick}
                />
                {/* TODO: attendanceRate={attendanceRate} totalCount={totalCount} 추가 */}
                <CalendarAttendancePanel clubId={clubId} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile: full-screen overlay below the sticky header (z-[70]) */}
      {!isTablet && selectedSchedule && (
        <div className="bg-background fixed inset-0 z-[65] flex flex-col overflow-hidden pt-16">
          {attendeeListOpen ? (
            <CalendarAttendeeListContent
              attendees={fullDetail?.attendees ?? []}
              onBack={closeAttendeeList}
            />
          ) : (
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CalendarScheduleDetailContentMobile
                schedule={fullDetail ?? selectedSchedule}
                clubId={clubId}
                onViewAttendees={openAttendeeList}
              />
            </div>
          )}
        </div>
      )}

      {/* Desktop-only modal */}
      <CalendarScheduleModal
        open={isTablet && selectedSchedule !== null}
        onOpenChange={(open) => {
          if (!open) handleCloseScheduleDetail();
        }}
        schedule={fullDetail ?? selectedSchedule}
        clubId={clubId}
        isLoading={isDetailLoading}
        onShare={handleShare}
      />
    </div>
  );
}

export { CalendarMain, type CalendarMainProps };
