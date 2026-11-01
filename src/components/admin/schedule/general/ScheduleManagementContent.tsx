'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { AdminPageContainer } from '@/components/admin/AdminPageContainer';
import { ScheduleManagementHeader } from '@/components/admin/schedule/general/ScheduleManagementHeader';
import { CalendarGrid } from '@/components/admin/schedule/calendar/CalendarGrid';
import { CalendarMini } from '@/components/admin/schedule/calendar/CalendarMini';
import { CalendarUpcomingPanel } from '@/components/admin/schedule/calendar/CalendarUpcomingPanel';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import {
  ScheduleFilterChips,
  type ScheduleFilter,
} from '@/components/admin/schedule/general/ScheduleFilterChips';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import AdminPlusIcon from '@/assets/icons/admin/ic_admin_plus.svg';
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
    <AdminPageContainer>
      <div className="tablet:p-700 flex min-w-0 flex-col p-400">
        {/* Header row */}
        <ScheduleManagementHeader
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          cardinals={cardinals}
          activeCardinal={activeCardinal}
          onCardinalSelect={setSelectedCardinalId}
          onCardinalSelectAll={() => setSelectedCardinalId(null)}
        />

        {/* Filter chips + Month nav row + CalendarGrid */}
        <div className="flex flex-col gap-[22px]">
          <ScheduleFilterChips
            totalCount={totalCount}
            eventCount={eventCount}
            sessionCount={sessionCount}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Month nav row + CalendarGrid + side panel */}
          {/* desktop: 2-col grid — MonthNav in [1,1], CalendarGrid in [2,1], side panel in [2,2] */}
          <div className="desktop:grid desktop:[grid-template-columns:minmax(0,1fr)_auto] desktop:gap-x-400 desktop:gap-y-300 flex min-w-0 flex-col gap-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-500">
                <MonthNavigator
                  year={year}
                  month={month}
                  onPrev={handlePrevMonth}
                  onNext={handleNextMonth}
                />
                <button
                  type="button"
                  onClick={goToToday}
                  className="border-line typo-caption1 text-text-normal flex cursor-pointer items-center justify-center rounded-full border px-300 py-200 transition-colors hover:border-neutral-500"
                >
                  오늘
                </button>
              </div>
              <Button variant="primary" size="md" onClick={() => openCreateModal('EVENT')}>
                <Icon src={AdminPlusIcon} size={20} className="text-text-inverse mr-1" />
                일정 생성
              </Button>
            </div>

            <CalendarGrid
              year={year}
              month={month}
              schedules={calendarSchedules}
              selectedDate={selectedDate}
              onSelectDate={handleToggleDate}
              onScheduleClick={handleScheduleClick}
              className="desktop:col-start-1 desktop:row-start-2 min-w-0"
            />

            <div className="tablet:flex desktop:col-start-2 desktop:row-start-2 desktop:max-h-[638px] desktop:self-start hidden flex-col items-start gap-500 self-stretch rounded-lg bg-neutral-200 p-500">
              <Link
                href={`/${clubId}/admin/schedule/overview`}
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'md' }),
                  'w-full gap-100',
                )}
              >
                일정 모아보기
                <Icon src={ArrowRightIcon} size={10} />
              </Link>

              <CalendarMini
                year={year}
                month={month}
                selectedDate={selectedDate}
                eventDates={eventDates}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToggleDate={handleToggleDate}
                className="desktop:flex hidden"
              />

              <CalendarUpcomingPanel
                schedules={calendarSchedules}
                onScheduleClick={handleScheduleClick}
              />
            </div>
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
    </AdminPageContainer>
  );
}

export { ScheduleManagementContent };
