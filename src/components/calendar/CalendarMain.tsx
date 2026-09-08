'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useScrollableList } from '@/hooks/useScrollableList';
import { CalendarFilter } from '@/components/calendar/CalendarFilter';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarMini } from '@/components/calendar/CalendarMini';
import { CalendarMobileGrid } from '@/components/calendar/CalendarMobileGrid';
import { CalendarUpcomingPanel, UpcomingItem } from '@/components/calendar/CalendarUpcomingPanel';
import { CalendarAttendancePanel } from '@/components/calendar/CalendarAttendancePanel';
import { CardinalDropdown } from '@/components/common';
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
  useCalendarActions,
} from '@/stores/useCalendarStore';
import { useClubId } from '@/stores';
import { CalendarScheduleModal } from '@/components/calendar/CalendarScheduleModal';
import { computeDDay, formatMobileDateHeader, toDateInputValue } from '@/utils/shared/date';
import { MOCK_SCHEDULES } from '@/mocks/calendar';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarMainProps {
  className?: string;
  // TODO: 캘린더 출석 요약 연결 — page.tsx에서 attendanceServerApi.getDetail 결과를 받아 전달
  // attendanceRate?: number;  // Math.round((attendanceCount / total) * 100)
  // totalCount?: number;       // AttendanceSummary.total
}

function CalendarMain({ className }: CalendarMainProps) {
  const clubId = useClubId();
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { sessionEnabled, eventEnabled, attendanceOnly } = useCalendarFilters();
  const { toggleDate, reset } = useCalendarActions();

  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDetail | null>(null);

  const schedules = MOCK_SCHEDULES.filter((s) => {
    const scheduleMonth = Number(s.start.split('-')[1]);
    const scheduleYear = Number(s.start.split('-')[0]);
    return scheduleYear === year && scheduleMonth === month;
  }).map((s) => ({ ...s, dDay: computeDDay(s.start) }));

  const filteredSchedules = schedules.filter((s) => {
    if (attendanceOnly) return s.type === 'SESSION';
    if (s.type === 'SESSION' && !sessionEnabled) return false;
    if (s.type === 'EVENT' && !eventEnabled) return false;
    return true;
  });

  const eventDates = filteredSchedules.map((s) => new Date(s.start));

  const activeDateStr = selectedDate ?? toDateInputValue(new Date());
  const selectedDateSchedules = filteredSchedules.filter((s) => s.start.startsWith(activeDateStr));

  const scrollKey = `${year}-${month}-${activeDateStr}`;
  const { listRef, hasScrolled, onScroll } = useScrollableList(scrollKey);

  const handleScheduleClick = (schedule: ScheduleDetail) => {
    setSelectedSchedule(schedule);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-8.75 self-stretch px-450 pt-450',
        'tablet:pb-20 tablet:px-16',
        className,
      )}
    >
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
            {/* TODO: 달 선택 피커 연결 */}
            <button
              type="button"
              aria-label="달 선택"
              className="text-icon-alternative flex cursor-pointer items-center justify-center rounded-sm p-200"
            >
              <Icon src={ArrowDownIcon} size={24} className="text-icon-normal" />
            </button>
            <Button variant="outlined" size="sm" className="typo-caption1" onClick={reset}>
              오늘
            </Button>
          </div>

          {/* Desktop: 캘린더 title + 오늘 button */}
          <div className="tablet:flex hidden flex-1 items-center gap-200">
            <h2 className="typo-h2 text-text-normal">캘린더</h2>
            <Button variant="outlined" size="sm" onClick={reset}>
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

        {/* Selected date header — full-width shadow only at the bottom, shown when list is scrollable */}
        <div
          className={cn(
            'relative z-10 -mx-450 flex shrink-0 items-center gap-200 px-450 py-300',
            hasScrolled && 'shadow-[0_4px_8px_rgba(0,0,0,0.06)] [clip-path:inset(0_0_-12px_0)]',
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

      <CalendarScheduleModal
        open={selectedSchedule !== null}
        onOpenChange={(open) => !open && setSelectedSchedule(null)}
        schedule={selectedSchedule}
        clubId={clubId}
      />
    </div>
  );
}

export { CalendarMain, type CalendarMainProps };
