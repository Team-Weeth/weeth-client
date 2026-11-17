'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminCalendarEditIcon } from '@/assets/icons/admin';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import { CardinalDropdown } from '@/components/admin';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import { ScheduleList } from '@/components/admin/schedule/general/ScheduleList';
import { ScheduleListSkeleton } from '@/components/admin/schedule/general/SchedulePageSkeleton';
import { useClubId } from '@/stores';
import { useCardinalSelector, useMonthNavigator } from '@/hooks';
import { useSessionMutations } from '@/hooks/admin';
import {
  useAdminMonthlySchedules,
  useDeleteSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';

const SessionTabContent = dynamic(() =>
  import('@/components/admin/schedule/session/SessionTabContent').then((m) => ({
    default: m.SessionTabContent,
  })),
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

type ScheduleTab = 'all' | 'session';

function SchedulePageContent() {
  const clubId = useClubId();
  const { cardinals, selectedCardinalId, setSelectedCardinalId, activeCardinal, latestCardinal } =
    useCardinalSelector();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab: ScheduleTab = searchParams.get('tab') === 'session' ? 'session' : 'all';
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
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'session') params.set('tab', 'session');
    else params.delete('tab');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<ScheduleType>('EVENT');
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);

  const openCreateModal = (tab: ScheduleType) => {
    setCreateModalTab(tab);
    setCreateModalOpen(true);
  };

  const { data: schedules = [], isLoading: isSchedulesLoading } = useAdminMonthlySchedules(
    currentYear,
    currentMonth,
    selectedCardinalId !== null ? activeCardinal?.cardinalNumber : undefined,
  );
  const { mutate: deleteSchedule } = useDeleteSchedule();
  const { submitCreate, forceConfirmDialog } = useSessionMutations();

  // 검색 필터링
  const query = searchValue.trim().toLowerCase();
  const filteredSchedules = query
    ? schedules.filter(
        (s) => s.title.toLowerCase().includes(query) || s.location.toLowerCase().includes(query),
      )
    : schedules;

  // 날짜순 정렬
  const sortedSchedules = [...filteredSchedules].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const handleDelete = (schedule: Schedule) => {
    deleteSchedule(schedule.id, {
      onSuccess: () => setEditTarget(null),
    });
  };

  return (
    <div className="tablet:p-700 flex min-w-0 flex-col gap-400 p-400">
      <CardinalDropdown
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        onSelect={setSelectedCardinalId}
        onSelectAll={() => setSelectedCardinalId(null)}
      />
      <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-0">
        <TabsList variant="line" className="h-8">
          <TabsTrigger value="all">전체 일정</TabsTrigger>
          <TabsTrigger value="session">세션</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-400">
          <Card className="tablet:gap-700 tablet:px-600 tablet:pt-600 tablet:pb-800 min-w-78 gap-600 px-400 pt-400 pb-600">
            <MonthNavigator
              year={currentYear}
              month={currentMonth}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />
            <div className="tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-between flex flex-col gap-300">
              <AdminSearchInput
                value={searchValue}
                onValueChange={setSearchValue}
                className="tablet:w-123 w-full"
              />
              <Button
                variant="primary"
                size="lg"
                className="tablet:w-auto tablet:shrink-0 w-full whitespace-nowrap"
                onClick={() => openCreateModal('EVENT')}
              >
                <Icon src={AdminCalendarEditIcon} size={20} className="text-text-inverse mr-1" />
                일반 일정 생성
              </Button>
            </div>

            {isSchedulesLoading ? (
              <ScheduleListSkeleton />
            ) : (
              <ScheduleList
                schedules={sortedSchedules}
                onEdit={setEditTarget}
                onDelete={handleDelete}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="session" className="mt-400">
          <SessionTabContent
            onCreateSession={() => openCreateModal('SESSION')}
            onManageAttendance={(session) =>
              router.push(`/${clubId}/admin/attendance?sessionId=${session.id}`)
            }
            cardinalNumber={
              selectedCardinalId === null ? null : (activeCardinal?.cardinalNumber ?? null)
            }
          />
        </TabsContent>
      </Tabs>

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

      {forceConfirmDialog}
    </div>
  );
}

export { SchedulePageContent };
