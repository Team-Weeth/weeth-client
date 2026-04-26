'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button, Card, Icon, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { AdminCalendarEditIcon } from '@/assets/icons/admin';
import { SearchIcon } from '@/assets/icons';
import { CardinalDropdown } from '@/components/admin';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import { ScheduleList } from '@/components/admin/schedule/general/ScheduleList';
import { SessionTabContent } from '@/components/admin/schedule/session/SessionTabContent';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import { EditSessionModal } from '@/components/admin/schedule/modal/EditSessionModal';
import { useCardinalSelector, useMonthNavigator } from '@/hooks';
import {
  useAdminMonthlySchedules,
  useCreateSession,
  useDeleteSchedule,
} from '@/hooks/queries/admin/useAdminScheduleQueries';
import type { Schedule, ScheduleType } from '@/types/admin/schedule';

type ScheduleTab = 'all' | 'session';

function SchedulePageContent() {
  const { cardinals, selectedCardinalId, setSelectedCardinalId, activeCardinal } =
    useCardinalSelector({ autoSelectLatest: true });
  const {
    year: currentYear,
    month: currentMonth,
    prev: handlePrevMonth,
    next: handleNextMonth,
  } = useMonthNavigator();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<ScheduleTab>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<ScheduleType>('EVENT');
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);

  const openCreateModal = (tab: ScheduleType) => {
    setCreateModalTab(tab);
    setCreateModalOpen(true);
  };

  const { data: schedules = [] } = useAdminMonthlySchedules(currentYear, currentMonth);
  const { mutate: deleteSchedule } = useDeleteSchedule();
  const { mutate: createSession } = useCreateSession();

  // 기수 필터링
  const cardinalFiltered =
    selectedCardinalId === null
      ? schedules
      : schedules.filter((s) => s.cardinal === activeCardinal?.cardinalNumber);

  // 탭 필터링
  const tabFiltered =
    activeTab === 'session'
      ? cardinalFiltered.filter((s) => s.type === 'SESSION')
      : cardinalFiltered;

  // 검색 필터링
  const query = searchValue.trim().toLowerCase();
  const filteredSchedules = query
    ? tabFiltered.filter(
        (s) => s.title.toLowerCase().includes(query) || s.location.toLowerCase().includes(query),
      )
    : tabFiltered;

  // 날짜순 정렬
  const sortedSchedules = [...filteredSchedules].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const handleDelete = (schedule: Schedule) => {
    deleteSchedule(schedule.id, {
      onSuccess: () => setEditTarget(null),
      // onError 처리도 토스트 유틸과 연결하는 것을 권장합니다.
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-400 p-700">
      <CardinalDropdown
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        onSelect={setSelectedCardinalId}
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ScheduleTab)}
        className="gap-0"
      >
        <TabsList variant="line" className="h-8">
          <TabsTrigger value="all">전체 일정</TabsTrigger>
          <TabsTrigger value="session">세션</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-400 overflow-x-auto">
          <Card className="min-w-172.5 gap-700 px-600 pt-600 pb-800">
            {/* Month navigator */}
            <MonthNavigator
              year={currentYear}
              month={currentMonth}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />

            {/* Search bar + Create button */}
            <div className="flex items-center justify-between">
              <div className="relative w-123">
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
              <Button variant="primary" size="lg" onClick={() => openCreateModal('EVENT')}>
                <Icon src={AdminCalendarEditIcon} size={20} className="text-text-inverse mr-1" />
                일반 일정 생성
              </Button>
            </div>

            {/* Schedule list */}
            <ScheduleList
              schedules={sortedSchedules}
              onEdit={setEditTarget}
              onDelete={handleDelete}
              onCreateClick={() => openCreateModal('EVENT')}
            />
          </Card>
        </TabsContent>

        <TabsContent value="session" className="mt-400">
          <SessionTabContent
            onCreateSession={() => openCreateModal('SESSION')}
            cardinalNumber={
              selectedCardinalId === null ? null : (activeCardinal?.cardinalNumber ?? null)
            }
          />
        </TabsContent>
      </Tabs>

      {/* Create schedule modal */}
      <CreateScheduleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        cardinalNumber={activeCardinal?.cardinalNumber ?? null}
        activeTab={createModalTab}
        onActiveTabChange={setCreateModalTab}
        onCreateSession={(body) => createSession(body)}
      />

      {/* Edit schedule modal */}
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

      {/* Edit session modal */}
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
          onDelete={() => handleDelete(editTarget)}
        />
      )}
    </div>
  );
}

export { SchedulePageContent };
