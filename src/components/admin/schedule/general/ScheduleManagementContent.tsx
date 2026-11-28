'use client';

import { useState } from 'react';
import { AdminPageContainer } from '@/components/admin/AdminPageContainer';
import { ScheduleManagementHeader } from '@/components/admin/schedule/general/ScheduleManagementHeader';
import {
  ScheduleFilterChips,
  type ScheduleFilter,
} from '@/components/admin/schedule/general/ScheduleFilterChips';
import { ScheduleCalendarSection } from '@/components/admin/schedule/general/ScheduleCalendarSection';
import { AdminScheduleMobileScreen } from '@/components/admin/schedule/general/AdminScheduleMobileScreen';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import { EditSessionModal } from '@/components/admin/schedule/modal/EditSessionModal';
import { AdminScheduleDetailModal } from '@/components/admin/schedule/modal/AdminScheduleDetailModal';
import { ScheduleDeleteAlertDialog } from '@/components/admin/schedule/modal/ScheduleDeleteAlertDialog';
import { useClubId } from '@/stores';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useMonthNavigator } from '@/hooks/useMonthNavigator';
import { useIsTablet } from '@/hooks/useIsTablet';
import { useSessionMutations } from '@/hooks/admin/useSessionMutations';
import {
  useAdminMonthlySchedules,
  useDeleteSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import { matchesScheduleQuery, toCalendarScheduleDetail } from '@/utils/admin/scheduleUtils';
import { isSessionInProgress } from '@/utils/admin/sessionUtils';
import { toDateInputValue } from '@/utils/shared/date';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';
import type { ScheduleDetail } from '@/types/calendar';

function ScheduleManagementContent() {
  const clubId = useClubId();
  const { cardinals, selectedCardinalId, setSelectedCardinalId, activeCardinal, latestCardinal } =
    useCardinalSelector();
  const { year, month, prev, next, goToToday, goToYearMonth } = useMonthNavigator();

  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<ScheduleFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<ScheduleType>('EVENT');
  const [detailTarget, setDetailTarget] = useState<Schedule | null>(null);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);
  // 다이얼로그가 닫히는 애니메이션 동안에도 문구가 유지되도록 대상과 열림 상태를 분리한다.
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Schedule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isTablet = useIsTablet();
  const isMobileDetailOpen = detailTarget !== null && !isTablet;

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
  const filtered = typeFiltered.filter((s) => matchesScheduleQuery(s, searchValue));

  // counts (before search filter, after type would be meaningless; use raw schedules)
  const totalCount = schedules.length;
  const eventCount = schedules.filter((s) => s.type === 'EVENT').length;
  const sessionCount = schedules.filter((s) => s.type === 'SESSION').length;

  // convert to calendar ScheduleDetail for shared components
  const calendarSchedules: ScheduleDetail[] = filtered.map(toCalendarScheduleDetail);
  const allCalendarSchedules: ScheduleDetail[] = schedules.map(toCalendarScheduleDetail);
  const eventDates = calendarSchedules.map((s) => new Date(s.start));

  const now = new Date();
  const upcomingSchedules = calendarSchedules.filter((s) => new Date(s.end) > now);

  // selected date schedules for mobile view
  // 사용자 캘린더(useCalendarScheduleData)와 같은 기준: 날짜를 고르지 않았으면 이번 달은 오늘, 다른 달은 그 달 1일.
  // 목록 데이터는 보고 있는 달의 일정뿐이라, 다른 달에서 오늘을 기준으로 삼으면 일정이 있어도 0개로 보인다.
  const today = toDateInputValue();
  const viewingMonthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const activeDateStr =
    selectedDate ?? (today.startsWith(viewingMonthPrefix) ? today : `${viewingMonthPrefix}-01`);
  const selectedDateSchedules = allCalendarSchedules.filter(
    (s) => s.start.slice(0, 10) <= activeDateStr && s.end.slice(0, 10) >= activeDateStr,
  );

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
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmTarget) return;
    const onSuccess = () => {
      setIsDeleteDialogOpen(false);
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
    <>
      <AdminScheduleMobileScreen
        year={year}
        month={month}
        selectedDate={selectedDate}
        activeDateStr={activeDateStr}
        schedules={allCalendarSchedules}
        selectedDateSchedules={selectedDateSchedules}
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        isPending={isPending}
        isError={isError}
        detailTarget={isMobileDetailOpen ? detailTarget : null}
        overviewHref={`/${clubId}/admin/schedule/overview?year=${year}&month=${month}`}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onGoToToday={handleGoToToday}
        onSelectYearMonth={(nextYear, nextMonth) => {
          goToYearMonth(nextYear, nextMonth);
          setSelectedDate(null);
        }}
        onDateClick={handleToggleDate}
        onCardinalSelect={setSelectedCardinalId}
        onCardinalSelectAll={() => setSelectedCardinalId(null)}
        onScheduleClick={handleScheduleClick}
        onCloseDetail={() => setDetailTarget(null)}
        onEditDetail={handleDetailEdit}
        onDeleteDetail={handleDetailDelete}
        onCreate={openCreateModal}
      />

      {/* Desktop view */}
      <AdminPageContainer className="tablet:flex hidden">
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
        </div>
      </AdminPageContainer>

      {/* Modals (shared between mobile and desktop) */}
      <CreateScheduleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        cardinalNumber={activeCardinal?.cardinalNumber ?? latestCardinal?.cardinalNumber ?? null}
        activeTab={createModalTab}
        onCreateSession={(body) => submitCreate(body)}
      />

      {/* 태블릿 이상은 모달, 모바일은 위의 AdminScheduleMobileDetailView 화면으로 상세를 표시한다. */}
      {detailTarget && isTablet && (
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

      <ScheduleDeleteAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        scheduleType={deleteConfirmTarget?.type}
        // TODO: [백엔드] 출석 진행 중인 세션 삭제를 서버에서도 거부하고 전용 에러 코드를 내려 달라고 요청.
        // 지금은 클라이언트 날짜 추정으로만 막고 있어 우회·오판이 가능하다. 코드가 정해지면 삭제 onError에서
        // 이 안내(inProgress)를 띄우도록 useSessionMutations의 force-confirm 처리와 같은 방식으로 연결한다.
        inProgress={
          deleteConfirmTarget?.type === 'SESSION' && isSessionInProgress(deleteConfirmTarget.start)
        }
        onConfirm={handleDeleteConfirm}
      />

      {forceConfirmDialog}
    </>
  );
}

export { ScheduleManagementContent };
