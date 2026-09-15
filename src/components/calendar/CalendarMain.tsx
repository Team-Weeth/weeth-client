'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useScrollableList } from '@/hooks/useScrollableList';
import { useIsTablet } from '@/hooks/useIsTablet';
import { useCalendarUrlSync } from '@/hooks/useCalendarUrlSync';
import { useCalendarScheduleData } from '@/hooks/queries/schedule/useCalendarScheduleData';
import { CalendarMonthPicker } from '@/components/calendar/CalendarMonthPicker';
import { CalendarScheduleDetailContentMobile } from '@/components/calendar/CalendarScheduleDetailContentMobile';
import { CalendarAttendeeListContent } from '@/components/calendar/CalendarAttendeeListContent';
import { CalendarPageHeader } from '@/components/calendar/CalendarPageHeader';
import { CalendarMobileView } from '@/components/calendar/CalendarMobileView';
import { CalendarDesktopView } from '@/components/calendar/CalendarDesktopView';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarMonthPickerOpen,
  useCalendarAttendeeListOpen,
  useCalendarSelectedSchedule,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import { useClubId } from '@/stores';
import { CalendarScheduleModal } from '@/components/calendar/CalendarScheduleModal';
import { CalendarScheduleDetailContentMobileSkeleton } from '@/components/calendar/skeleton/CalendarScheduleDetailContentMobileSkeleton';

interface CalendarMainProps {
  className?: string;
}

function CalendarMain({ className }: CalendarMainProps) {
  const clubId = useClubId();
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
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
  const [pickerYear, setPickerYear] = useState(year);

  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });

  const { handleOpenScheduleDetail, handleCloseScheduleDetail, handleReset, handleShare } =
    useCalendarUrlSync(openScheduleDetail, closeScheduleDetail, reset);

  const {
    filteredSchedules,
    eventDates,
    activeDateStr,
    selectedDateSchedules,
    scrollKey,
    fullDetail,
    isDetailLoading,
  } = useCalendarScheduleData(activeCardinal?.cardinalNumber);

  const { listRef, hasScrolled, onScroll } = useScrollableList(scrollKey);

  useEffect(() => {
    if (!monthPickerOpen) return;
    const mql = window.matchMedia('(min-width: 696px)');
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) closeMonthPicker();
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [monthPickerOpen, closeMonthPicker]);

  useEffect(() => {
    return () => {
      closeScheduleDetail();
      closeMonthPicker();
    };
  }, [closeScheduleDetail, closeMonthPicker]);

  return (
    <div
      className={cn(
        'flex flex-col self-stretch',
        monthPickerOpen ? 'tablet:hidden' : 'tablet:pb-20 tablet:px-16 gap-8.75 px-450 pt-450',
        className,
      )}
    >
      {monthPickerOpen ? (
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
          <CalendarPageHeader
            year={year}
            month={month}
            cardinals={cardinals}
            activeCardinal={activeCardinal}
            onOpenMonthPicker={() => {
              setPickerYear(year);
              openMonthPicker();
            }}
            onReset={handleReset}
            onCardinalSelect={setSelectedCardinalId}
          />
          <CalendarMobileView
            filteredSchedules={filteredSchedules}
            activeDateStr={activeDateStr}
            selectedDateSchedules={selectedDateSchedules}
            hasScrolled={hasScrolled}
            listRef={listRef}
            onScroll={onScroll}
            onScheduleClick={handleOpenScheduleDetail}
          />
          <CalendarDesktopView
            year={year}
            month={month}
            filteredSchedules={filteredSchedules}
            selectedDate={selectedDate}
            eventDates={eventDates}
            clubId={clubId}
            onSelectDate={toggleDate}
            onScheduleClick={handleOpenScheduleDetail}
            onCrossMonthDateClick={(dateStr, y, m) => goToYearMonthDate(y, m, dateStr)}
          />
        </>
      )}

      {!isTablet && selectedSchedule && (
        <div className="bg-background fixed inset-0 z-[65] flex flex-col overflow-hidden pt-16">
          {attendeeListOpen ? (
            <CalendarAttendeeListContent
              attendees={fullDetail?.attendees ?? []}
              onBack={closeAttendeeList}
            />
          ) : isDetailLoading ? (
            <CalendarScheduleDetailContentMobileSkeleton />
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
