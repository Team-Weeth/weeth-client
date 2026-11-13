'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { AdminPageContainer } from '@/components/admin/AdminPageContainer';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import { ScheduleList } from '@/components/admin/schedule/general/ScheduleList';
import { ScheduleListSkeleton } from '@/components/admin/schedule/general/SchedulePageSkeleton';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import AdminBackIcon from '@/assets/icons/admin/ic_admin_back.svg';
import SearchIcon from '@/assets/icons/search.svg';
import AdminPlusIcon from '@/assets/icons/admin/ic_admin_plus.svg';
import { useMonthNavigator } from '@/hooks/useMonthNavigator';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useSessionMutations } from '@/hooks/admin/useSessionMutations';
import {
  useAdminMonthlySchedules,
  useDeleteSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';

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

  const { data: schedules = [], isLoading } = useAdminMonthlySchedules(
    currentYear,
    currentMonth,
    activeCardinal?.cardinalNumber,
  );
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
  const sessionCount = schedules.filter((s) => s.type === 'SESSION').length;
  const chipCounts: Record<ScheduleType, number> = { EVENT: eventCount, SESSION: sessionCount };

  const typeFiltered = schedules.filter((s) => s.type === activeFilter);

  const query = searchValue.trim().toLowerCase();
  const filtered = query
    ? typeFiltered.filter(
        (s) => s.title.toLowerCase().includes(query) || s.location.toLowerCase().includes(query),
      )
    : typeFiltered;

  const sortedSchedules = [...filtered].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

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
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-start gap-300 p-700">
          <Button variant="secondary" size="icon-md" onClick={() => router.back()}>
            <Icon src={AdminBackIcon} size={24} className="text-icon-normal" />
          </Button>
          <h1 className="typo-h2 text-text-strong">일정 모아보기</h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-[22px] px-500">
          {/* Filter chips */}
          <div className="bg-background relative flex h-12 w-fit items-center gap-[5px] overflow-hidden rounded-md px-[6px]">
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

          {/* Main content card */}
          <div className="bg-background flex flex-col gap-700 rounded-lg p-600">
            <MonthNavigator
              year={currentYear}
              month={currentMonth}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              className="justify-start"
            />

            <div className="flex items-center justify-between gap-400">
              <div className="relative flex-1">
                <Icon
                  src={SearchIcon}
                  size={24}
                  className="text-icon-alternative absolute top-1/2 left-400 -translate-y-1/2"
                />
                <input
                  type="text"
                  autoComplete="off"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="bg-container-neutral typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm py-300 pr-300 pl-14 focus:outline-none"
                />
              </div>
              <Button
                variant="primary"
                size="lg"
                className="shrink-0"
                onClick={() => openCreateModal(activeFilter)}
              >
                <Icon src={AdminPlusIcon} size={20} className="text-text-inverse mr-100" />
                일정 생성
              </Button>
            </div>

            {isLoading ? (
              <ScheduleListSkeleton />
            ) : (
              <ScheduleList
                schedules={sortedSchedules}
                onEdit={setEditTarget}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>

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
    </AdminPageContainer>
  );
}

export { ScheduleOverviewContent };
