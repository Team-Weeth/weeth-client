'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { CardinalDropdown } from '@/components/admin/CardinalDropdown';
import { SearchBar } from '@/components/ui/SearchBar';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarMini } from '@/components/calendar/CalendarMini';
import { CalendarUpcomingPanel } from '@/components/calendar/CalendarUpcomingPanel';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import { ScheduleFilterChips, type ScheduleFilter } from '@/components/admin/schedule/general/ScheduleFilterChips';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import AdminCalendarEditIcon from '@/assets/icons/admin/ic_admin_calendar_edit.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import { useClubId } from '@/stores';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useMonthNavigator } from '@/hooks/useMonthNavigator';
import { useSessionMutations } from '@/hooks/admin/useSessionMutations';
import {
  useAdminMonthlySchedules,
  useDeleteSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import { toCalendarScheduleDetail } from '@/utils/admin/scheduleUtils';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';
import type { ScheduleDetail } from '@/types/calendar';

function ScheduleManagementContent() {
  const clubId = useClubId();
  const { cardinals, selectedCardinalId, setSelectedCardinalId, activeCardinal, latestCardinal } =
    useCardinalSelector();
  const { year, month, prev, next, goToToday } = useMonthNavigator();

  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<ScheduleType>('EVENT');
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);

  const { data: schedules = [] } = useAdminMonthlySchedules(
    year,
    month,
    selectedCardinalId !== null ? activeCardinal?.cardinalNumber : undefined,
  );
  const { mutate: deleteSchedule } = useDeleteSchedule();
  const { submitCreate, forceConfirmDialog } = useSessionMutations();

  // filter by type
  const typeFiltered =
    activeFilter === 'all' ? schedules : schedules.filter((s) => s.type === activeFilter);

  // filter by search
  const query = searchValue.trim().toLowerCase();
  const filtered = query
    ? typeFiltered.filter(
        (s) => s.title.toLowerCase().includes(query) || s.location.toLowerCase().includes(query),
      )
    : typeFiltered;

  // counts (before search filter, after type would be meaningless; use raw schedules)
  const totalCount = schedules.length;
  const eventCount = schedules.filter((s) => s.type === 'EVENT').length;
  const sessionCount = schedules.filter((s) => s.type === 'SESSION').length;

  // convert to calendar ScheduleDetail for shared components
  const calendarSchedules: ScheduleDetail[] = filtered.map(toCalendarScheduleDetail);
  const eventDates = calendarSchedules.map((s) => new Date(s.start));

  const handleToggleDate = (dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  };

  const handlePrevMonth = () => {
    prev();
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    next();
    setSelectedDate(null);
  };

  const handleScheduleClick = (schedule: ScheduleDetail) => {
    const original = schedules.find((s) => s.id === schedule.id);
    if (original) setEditTarget(original);
  };

  const handleDelete = (schedule: Schedule) => {
    deleteSchedule(schedule.id, {
      onSuccess: () => setEditTarget(null),
    });
  };

  const openCreateModal = (tab: ScheduleType) => {
    setCreateModalTab(tab);
    setCreateModalOpen(true);
  };

  return (
    <div className="tablet:p-700 flex min-w-0 flex-col gap-400 p-400">
      {/* Header row */}
      <div className="flex items-center justify-between gap-400">
        <h1 className="typo-h3 text-text-strong shrink-0">일정 관리</h1>
        <div className="flex items-center gap-300">
          <SearchBar
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="검색어를 입력하세요"
            expandable
          />
          <CardinalDropdown
            cardinals={cardinals}
            activeCardinal={activeCardinal}
            onSelect={setSelectedCardinalId}
            onSelectAll={() => setSelectedCardinalId(null)}
          />
        </div>
      </div>

      {/* Filter chips + Month nav row */}
      <div className="flex flex-col gap-300">
        <ScheduleFilterChips
          totalCount={totalCount}
          eventCount={eventCount}
          sessionCount={sessionCount}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-300">
            <MonthNavigator year={year} month={month} onPrev={handlePrevMonth} onNext={handleNextMonth} />
            <button
              type="button"
              onClick={goToToday}
              className="typo-caption1 text-text-alternative hover:text-text-normal cursor-pointer transition-colors"
            >
              오늘
            </button>
          </div>
          <Button variant="primary" size="md" onClick={() => openCreateModal('EVENT')}>
            <Icon src={AdminCalendarEditIcon} size={20} className="text-text-inverse mr-1" />
            일정 생성
          </Button>
        </div>
      </div>

      {/* Main content: CalendarGrid + side panel */}
      <div className="flex items-start gap-400">
        <CalendarGrid
          year={year}
          month={month}
          schedules={calendarSchedules}
          selectedDate={selectedDate}
          onSelectDate={handleToggleDate}
          onScheduleClick={handleScheduleClick}
          className="min-w-0 flex-1"
        />

        <div className="hidden flex-col gap-300 desktop:flex">
          {/* Overview link */}
          <Link
            href={`/${clubId}/admin/schedule/overview`}
            className="bg-container-neutral hover:bg-container-neutral-interaction flex w-[195px] items-center justify-between rounded-md px-[14px] py-300 transition-colors"
          >
            <span className="typo-caption1 text-text-normal">일정 모아보기</span>
            <Image src={ArrowRightIcon} alt="" width={10} height={10} className="text-icon-alternative" />
          </Link>

          <CalendarMini
            year={year}
            month={month}
            selectedDate={selectedDate}
            eventDates={eventDates}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToggleDate={handleToggleDate}
          />

          <CalendarUpcomingPanel
            schedules={calendarSchedules}
            onScheduleClick={handleScheduleClick}
          />
        </div>
      </div>

      {/* Modals */}
      <CreateScheduleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        cardinalNumber={activeCardinal?.cardinalNumber ?? latestCardinal?.cardinalNumber ?? null}
        activeTab={createModalTab}
        onActiveTabChange={setCreateModalTab}
        onCreateSession={(body) => submitCreate(body)}
      />

      {editTarget?.type === 'EVENT' && (
        <EditScheduleModal
          key={editTarget.id}
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          schedule={editTarget}
          onDelete={handleDelete}
        />
      )}

      {forceConfirmDialog}
    </div>
  );
}

export { ScheduleManagementContent };
