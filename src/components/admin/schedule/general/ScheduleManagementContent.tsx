'use client';

import { useState } from 'react';
import { AdminPageContainer } from '@/components/admin/AdminPageContainer';
import { ScheduleManagementHeader } from '@/components/admin/schedule/general/ScheduleManagementHeader';
import {
  ScheduleFilterChips,
  type ScheduleFilter,
} from '@/components/admin/schedule/general/ScheduleFilterChips';
import { ScheduleCalendarSection } from '@/components/admin/schedule/general/ScheduleCalendarSection';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import { EditSessionModal } from '@/components/admin/schedule/modal/EditSessionModal';
import { AdminScheduleDetailModal } from '@/components/admin/schedule/modal/AdminScheduleDetailModal';
import { CustomAlertDialog } from '@/components/alert/CustomAlertDialog';
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
  const [detailTarget, setDetailTarget] = useState<Schedule | null>(null);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Schedule | null>(null);
  const {
    data: schedules = [],
    isPending,
    isError,
  } = useAdminMonthlySchedules(
    year,
    month,
    selectedCardinalId !== null ? activeCardinal?.cardinalNumber : undefined,
  );
  const { mutate: deleteSchedule } = useDeleteSchedule();
  const { submitCreate, submitDeleteSession, forceConfirmDialog } = useSessionMutations();

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

  const now = new Date();
  const upcomingSchedules = calendarSchedules.filter((s) => new Date(s.end) > now);

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

  const handleGoToToday = () => {
    goToToday();
    setSelectedDate(null);
  };

  const handleScheduleClick = (schedule: ScheduleDetail) => {
    const original = schedules.find((s) => s.id === schedule.id);
    if (original) setDetailTarget(original);
  };

  const handleDetailEdit = (schedule: Schedule) => {
    setDetailTarget(null);
    setEditTarget(schedule);
  };

  const handleDetailDelete = (schedule: Schedule) => {
    setDeleteConfirmTarget(schedule);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmTarget) return;
    const onSuccess = () => {
      setDeleteConfirmTarget(null);
      setDetailTarget(null);
    };
    if (deleteConfirmTarget.type === 'SESSION') {
      submitDeleteSession(deleteConfirmTarget.id, 'THIS_ONLY', false, { onSuccess });
    } else {
      deleteSchedule(deleteConfirmTarget.id, { onSuccess });
    }
  };

  const handleEditDelete = (schedule: Schedule) => {
    if (schedule.type === 'SESSION') {
      submitDeleteSession(schedule.id, 'THIS_ONLY', false, {
        onSuccess: () => setEditTarget(null),
      });
    } else {
      deleteSchedule(schedule.id, {
        onSuccess: () => setEditTarget(null),
      });
    }
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

          <ScheduleCalendarSection
            year={year}
            month={month}
            calendarSchedules={calendarSchedules}
            selectedDate={selectedDate}
            eventDates={eventDates}
            upcomingSchedules={upcomingSchedules}
            isPending={isPending}
            isError={isError}
            clubId={clubId}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onGoToToday={handleGoToToday}
            onToggleDate={handleToggleDate}
            onScheduleClick={handleScheduleClick}
            onCreateSchedule={openCreateModal}
          />
        </div>

        {/* Modals */}
        <CreateScheduleModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          cardinalNumber={activeCardinal?.cardinalNumber ?? latestCardinal?.cardinalNumber ?? null}
          activeTab={createModalTab}
          onCreateSession={(body) => submitCreate(body)}
        />

        {detailTarget && (
          <AdminScheduleDetailModal
            key={`detail-${detailTarget.id}`}
            open
            onOpenChange={(open) => {
              if (!open) setDetailTarget(null);
            }}
            schedule={detailTarget}
            onEdit={handleDetailEdit}
            onDelete={handleDetailDelete}
          />
        )}

        {editTarget?.type === 'EVENT' && (
          <EditScheduleModal
            key={editTarget.id}
            open
            onOpenChange={(open) => {
              if (!open) setEditTarget(null);
            }}
            schedule={editTarget}
            onDelete={handleEditDelete}
          />
        )}

        {editTarget?.type === 'SESSION' && (
          <EditSessionModal
            key={editTarget.id}
            open
            onOpenChange={(open) => {
              if (!open) setEditTarget(null);
            }}
            target={{
              id: editTarget.id,
              cardinal: editTarget.cardinal,
              title: editTarget.title,
              start: editTarget.start,
              end: editTarget.end,
              status: 'SCHEDULED',
            }}
          />
        )}

        <CustomAlertDialog
          open={deleteConfirmTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteConfirmTarget(null);
          }}
          title="이 일정을 삭제하시겠어요?"
          description={'삭제된 일정은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
          actionLabel="삭제"
          onAction={handleDeleteConfirm}
          placement="center"
        />

        {forceConfirmDialog}
      </div>
    </AdminPageContainer>
  );
}

export { ScheduleManagementContent };
