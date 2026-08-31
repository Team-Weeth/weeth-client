'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Icon, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { AdminCalendarEditIcon } from '@/assets/icons/admin';
import { SearchIcon } from '@/assets/icons';
import { CardinalDropdown } from '@/components/admin';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import { ScheduleList } from '@/components/admin/schedule/general/ScheduleList';
import { SessionTabContent } from '@/components/admin/schedule/session/SessionTabContent';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import { useClubId } from '@/stores';
import { useCardinalSelector, useMonthNavigator } from '@/hooks';
import { useSessionMutations } from '@/hooks/admin';
import {
  useAdminMonthlySchedules,
  useDeleteSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import { ScheduleListSkeleton } from '@/components/admin/schedule/general/SchedulePageSkeleton';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';

type ScheduleTab = 'all' | 'session';

function SchedulePageContent() {
  const clubId = useClubId();
  const { cardinals, selectedCardinalId, setSelectedCardinalId, activeCardinal, latestCardinal } =
    useCardinalSelector();
  const {
    year: currentYear,
    month: currentMonth,
    prev: handlePrevMonth,
    next: handleNextMonth,
  } = useMonthNavigator();
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab: ScheduleTab = searchParams.get('tab') === 'session' ? 'session' : 'all';
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
              <div className="tablet:w-123 relative w-full">
                <Image
                  src={SearchIcon}
                  alt="검색"
                  width={24}
                  height={24}
                  className="absolute top-1/2 left-400 -translate-y-1/2"
                />
                <input
                  type="text"
                  name=""
                  autoComplete="off"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for name"
                  className="bg-container-neutral-alternative typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm py-300 pr-300 pl-14 focus:outline-none"
                />
              </div>
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
                onCreateClick={() => openCreateModal('EVENT')}
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

export { SchedulePageContent };
