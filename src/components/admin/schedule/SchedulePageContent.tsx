'use client';

import { useState } from 'react';
import Image from 'next/image';

import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { Icon } from '@/components/ui';
import { AdminCalendarEditIcon } from '@/assets/icons/admin';
import { ArrowDownIcon, SearchIcon } from '@/assets/icons';
import { MonthNavigator } from '@/components/admin/schedule/MonthNavigator';
import { ScheduleList } from '@/components/admin/schedule/ScheduleList';
import { CreateScheduleModal } from '@/components/admin/schedule/modal/CreateScheduleModal';
import { EditScheduleModal } from '@/components/admin/schedule/modal/EditScheduleModal';
import { useCardinals } from '@/hooks/queries';
import type { Schedule } from '@/types/admin/schedule';

type ScheduleTab = 'all' | 'session';

const MOCK_SCHEDULES: Schedule[] = [
  {
    scheduleId: 1,
    title: '7기 1차 정기모임',
    type: 'SESSION',
    startDateTime: '2026-04-12T20:00:00',
    endDateTime: '2026-04-12T22:00:00',
    location: '가천대 체육관',
    cardinalNumber: 7,
  },
  {
    scheduleId: 2,
    title: '중간고사 기간',
    type: 'GENERAL',
    startDateTime: '2026-04-14T20:00:00',
    endDateTime: '2026-04-14T22:00:00',
    location: '가천관 123호',
    cardinalNumber: 7,
  },
  {
    scheduleId: 3,
    title: '7기 2차 정기모임',
    type: 'SESSION',
    startDateTime: '2026-04-15T20:00:00',
    endDateTime: '2026-04-15T22:00:00',
    location: '종합경기장',
    cardinalNumber: 7,
  },
];

function SchedulePageContent() {
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<ScheduleTab>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);

  const activeCardinal = selectedCardinalId
    ? cardinals.find((c) => c.id === selectedCardinalId)
    : undefined;

  const schedules = MOCK_SCHEDULES;

  // 기수 필터링
  const cardinalFiltered =
    selectedCardinalId === null
      ? schedules
      : schedules.filter((s) => s.cardinalNumber === activeCardinal?.cardinalNumber);
  // 월 필터링
  const monthFiltered = cardinalFiltered.filter((s) => {
    const date = new Date(s.startDateTime);
    return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
  });

  // 탭 필터링
  const tabFiltered =
    activeTab === 'session' ? monthFiltered.filter((s) => s.type === 'SESSION') : monthFiltered;

  // 검색 필터링
  const query = searchValue.trim().toLowerCase();
  const filteredSchedules = query
    ? tabFiltered.filter(
        (s) => s.title.toLowerCase().includes(query) || s.location.toLowerCase().includes(query),
      )
    : tabFiltered;

  // 날짜순 정렬
  const sortedSchedules = [...filteredSchedules].sort(
    (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
  );

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDelete = (_schedule: Schedule) => {
    // TODO: API 연동 시 deleteSchedule(_schedule) 호출
  };

  return (
    <div className="flex min-w-3xl flex-col gap-400 p-700">
      {/* Generation filter */}
      <Card className="w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="border-line flex cursor-pointer items-center gap-700 rounded-sm border py-300 pr-300 pl-400"
            >
              <span className="typo-sub2 text-text-normal w-12 text-left">
                {selectedCardinalId !== null && activeCardinal
                  ? `${activeCardinal.cardinalNumber}기`
                  : '기수'}
              </span>
              <Image src={ArrowDownIcon} alt="기수 선택" width={24} height={24} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {cardinals.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => setSelectedCardinalId(c.id)}>
                {c.cardinalNumber}기
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

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

        <TabsContent value={activeTab}>
          <Card className="mt-400 gap-700 px-600 pt-600 pb-800">
            {/* Month navigator */}
            <MonthNavigator
              year={currentYear}
              month={currentMonth}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />

            {/* Search bar + Create button */}
            <div className="flex items-center justify-between">
              <div className="relative w-[492px]">
                <Image
                  src={SearchIcon}
                  alt="검색"
                  width={24}
                  height={24}
                  className="absolute top-1/2 left-400 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search for name"
                  className="bg-container-neutral-alternative typo-body1 placeholder:text-text-alternative h-12 w-full rounded-sm py-300 pr-300 pl-14 focus:outline-none"
                />
              </div>
              <Button variant="primary" size="lg" onClick={() => setCreateModalOpen(true)}>
                <Icon src={AdminCalendarEditIcon} size={20} className="text-text-inverse mr-1" />
                일반 일정 생성
              </Button>
            </div>

            {/* Schedule list */}
            <ScheduleList
              schedules={sortedSchedules}
              onEdit={setEditTarget}
              onDelete={handleDelete}
              onCreateClick={() => setCreateModalOpen(true)}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create schedule modal */}
      <CreateScheduleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        cardinalNumber={activeCardinal?.cardinalNumber ?? null}
      />

      {/* Edit schedule modal */}
      {editTarget && (
        <EditScheduleModal
          key={editTarget.scheduleId}
          open
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
          }}
          schedule={editTarget}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export { SchedulePageContent };
