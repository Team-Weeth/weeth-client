'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { AdminPageContainer } from '@/components/admin/AdminPageContainer';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import { ScheduleList } from '@/components/admin/schedule/general/ScheduleList';
import { ScheduleListSkeleton } from '@/components/admin/schedule/general/SchedulePageSkeleton';
import AdminBackIcon from '@/assets/icons/admin/ic_admin_back.svg';
import AdminPlusIcon from '@/assets/icons/admin/ic_admin_plus.svg';
import InfoCircleIcon from '@/assets/icons/info_circle.svg';
import { isRepeating } from '@/utils/admin/sessionScheduleListUtils';
import { matchesScheduleQuery } from '@/utils/admin/scheduleUtils';
import { useMonthNavigator } from '@/hooks/useMonthNavigator';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useSessionMutations } from '@/hooks/admin/useSessionMutations';
import {
  useAdminMonthlySchedules,
  useAdminMonthlySessionList,
  useDeleteSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

const SessionScheduleList = dynamic(
  () =>
    import('@/components/admin/schedule/general/SessionScheduleList').then((m) => ({
      default: m.SessionScheduleList,
    })),
  { loading: () => <ScheduleListSkeleton /> },
);

const CreateScheduleModal = dynamic(() =>
  import('@/components/admin/schedule/modal/CreateScheduleModal').then((m) => ({
    default: m.CreateScheduleModal,
  })),
);

const EditScheduleModal = dynamic(() =>
  import('@/components/admin/schedule/modal/EditScheduleModal').then((m) => ({
    default: m.EditScheduleModal,
  })),
);

const EditSessionModal = dynamic(() =>
  import('@/components/admin/schedule/modal/EditSessionModal').then((m) => ({
    default: m.EditSessionModal,
  })),
);

const FILTER_CHIPS: { key: ScheduleType; label: string }[] = [
  { key: 'EVENT', label: '일반 일정' },
  { key: 'SESSION', label: '세션' },
];

function ScheduleOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCardinal, latestCardinal } = useCardinalSelector();

  const {
    year: currentYear,
    month: currentMonth,
    prev: handlePrevMonth,
    next: handleNextMonth,
  } = useMonthNavigator(
    searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
    searchParams.get('month') ? Number(searchParams.get('month')) : undefined,
  );

  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState<ScheduleType>('EVENT');
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [chipIndicator, setChipIndicator] = useState({ left: 0, width: 0, visible: false });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<ScheduleType>('EVENT');
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);
  const [editSessionTarget, setEditSessionTarget] = useState<{
    target: AdminSession | AdminSessionGroup;
    parentGroup?: AdminSessionGroup;
  } | null>(null);

  const {
    data: schedules = [],
    isLoading: isEventLoading,
    isError: isEventError,
    refetch: refetchEvents,
  } = useAdminMonthlySchedules(currentYear, currentMonth, activeCardinal?.cardinalNumber);
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    isError: isSessionError,
    refetch: refetchSessions,
  } = useAdminMonthlySessionList(currentYear, currentMonth, activeCardinal?.cardinalNumber);
  const sessionGroups = sessionData?.sessions ?? [];

  const { mutate: deleteSchedule } = useDeleteSchedule();
  const { submitCreate, forceConfirmDialog } = useSessionMutations();

  useEffect(() => {
    const index = FILTER_CHIPS.findIndex((c) => c.key === activeFilter);
    const el = chipRefs.current[index];
    if (el) {
      setChipIndicator({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
    }
  }, [activeFilter]);

  const eventCount = schedules.filter((s) => s.type === 'EVENT').length;
  const sessionGroupCount = sessionGroups.length;
  const chipCounts: Record<ScheduleType, number> = {
    EVENT: eventCount,
    SESSION: sessionGroupCount,
  };

  const eventFiltered = schedules.filter(
    (s) => s.type === 'EVENT' && matchesScheduleQuery(s, searchValue),
  );

  const sortedSchedules = [...eventFiltered].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const handleDelete = (schedule: Schedule) => {
    deleteSchedule(schedule.id, {
      onSuccess: () => setEditTarget(null),
    });
  };

  const handleEditGroup = (group: AdminSessionGroup) => {
    if (isRepeating(group)) {
      setEditSessionTarget({ target: group });
    } else {
      const session = group.sessions[0];
      if (session) setEditSessionTarget({ target: session });
    }
  };

  const handleEditSession = (session: AdminSession) => {
    const parentGroup = sessionGroups.find((g) => g.sessions.some((s) => s.id === session.id));
    setEditSessionTarget({ target: session, parentGroup });
  };

  const openCreateModal = (tab: ScheduleType) => {
    setCreateModalTab(tab);
    setCreateModalOpen(true);
  };

  return (
    <AdminPageContainer className="h-full">
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex shrink-0 flex-col items-start gap-300 p-700">
          <Button
            variant="secondary"
            size="icon-md"
            aria-label="뒤로 가기"
            onClick={() => router.back()}
          >
            <Icon src={AdminBackIcon} size={24} className="text-icon-normal" />
          </Button>
          <h1 className="typo-h2 text-text-strong">일정 모아보기</h1>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-[22px] px-700 pb-[26px]">
          {/* Filter chips */}
          <div className="bg-background relative flex h-12 w-fit shrink-0 items-center gap-[5px] overflow-hidden rounded-md px-[6px]">
            {/* Sliding indicator */}
            <div
              style={{ left: chipIndicator.left, width: chipIndicator.width }}
              className={cn(
                'border-line bg-container-floating absolute top-[6px] bottom-[6px] rounded-[10px] border',
                chipIndicator.visible
                  ? 'transition-[left,width] duration-200 ease-out'
                  : 'opacity-0',
              )}
            />
            {/* Chip buttons */}
            {FILTER_CHIPS.map(({ key, label }, index) => {
              const isActive = activeFilter === key;
              return (
                <button
                  key={key}
                  ref={(el) => {
                    chipRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => setActiveFilter(key)}
                  className={cn(
                    'typo-button2 relative flex cursor-pointer items-center justify-center rounded-[10px] px-400 py-200 whitespace-nowrap transition-colors duration-200',
                    isActive ? 'text-text-inverse' : 'text-text-alternative',
                  )}
                >
                  {label} {chipCounts[key]}
                </button>
              );
            })}
          </div>

          {/* Below chips: optional SESSION banner + main content card */}
          <div className="flex min-h-0 flex-1 flex-col gap-300">
            {activeFilter === 'SESSION' && (
              <div className="bg-background flex shrink-0 items-center gap-200 rounded-md px-300 py-400">
                <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative shrink-0" />
                <p className="typo-body2 text-text-normal">
                  세션은 출석을 진행할 동아리의 공식적인 모임을 관리합니다. 생성된 세션은 출석
                  관리에 자동으로 연결되며, 출석 내역 확인 및 수정은 출석 관리 탭에서 진행해주세요.
                </p>
              </div>
            )}

            {/* Main content card */}
            <div className="bg-background flex min-h-0 flex-col gap-700 overflow-hidden rounded-lg p-600">
              <MonthNavigator
                year={currentYear}
                month={currentMonth}
                onPrev={handlePrevMonth}
                onNext={handleNextMonth}
                className="shrink-0 justify-start"
              />

              <div className="flex shrink-0 items-center justify-between gap-400">
                <AdminSearchInput
                  value={searchValue}
                  onValueChange={setSearchValue}
                  className="w-[492px] shrink-0"
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="shrink-0"
                  onClick={() => openCreateModal(activeFilter)}
                >
                  <Icon src={AdminPlusIcon} size={20} className="text-text-inverse mr-100" />
                  {activeFilter === 'SESSION' ? '세션 생성' : '일정 생성'}
                </Button>
              </div>

              {activeFilter === 'SESSION' ? (
                isSessionLoading ? (
                  <ScheduleListSkeleton />
                ) : isSessionError ? (
                  <div className="flex h-[188px] flex-col items-center justify-center gap-300">
                    <p className="typo-body2 text-text-alternative">세션을 불러오지 못했습니다.</p>
                    <Button variant="secondary" size="md" onClick={() => refetchSessions()}>
                      다시 시도
                    </Button>
                  </div>
                ) : (
                  <SessionScheduleList
                    className={sessionGroups.length > 0 ? 'min-h-0 flex-1' : undefined}
                    sessions={sessionGroups}
                    searchValue={searchValue}
                    onEditGroup={handleEditGroup}
                    onEditSession={handleEditSession}
                  />
                )
              ) : isEventLoading ? (
                <ScheduleListSkeleton />
              ) : isEventError ? (
                <div className="flex h-[188px] flex-col items-center justify-center gap-300">
                  <p className="typo-body2 text-text-alternative">일정을 불러오지 못했습니다.</p>
                  <Button variant="secondary" size="md" onClick={() => refetchEvents()}>
                    다시 시도
                  </Button>
                </div>
              ) : (
                <ScheduleList
                  className={sortedSchedules.length > 0 ? 'min-h-0 flex-1' : undefined}
                  schedules={sortedSchedules}
                  onEdit={setEditTarget}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateScheduleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        cardinalNumber={activeCardinal?.cardinalNumber ?? latestCardinal?.cardinalNumber ?? null}
        activeTab={createModalTab}
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

      {editSessionTarget !== null &&
        (() => {
          const t = editSessionTarget.target;
          const key = 'sessions' in t ? (t.sessions[0]?.id ?? t.groupId) : t.id;
          return (
            <EditSessionModal
              key={key}
              open
              onOpenChange={(open) => {
                if (!open) setEditSessionTarget(null);
              }}
              target={t}
              parentGroup={editSessionTarget.parentGroup}
            />
          );
        })()}

      {forceConfirmDialog}
    </AdminPageContainer>
  );
}

export { ScheduleOverviewContent };
