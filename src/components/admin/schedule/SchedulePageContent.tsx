'use client';

import { useState } from 'react';
import Image from 'next/image';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
import { useAdminSchedules } from '@/hooks/queries/admin/useAdminScheduleQueries';
import { useDeleteSchedule } from '@/hooks/mutations/admin/useAdminScheduleMutations';
import { useCardinals } from '@/hooks/queries';
import type { Schedule } from '@/types/admin/schedule';

type ScheduleTab = 'all' | 'session';

function SchedulePageContent() {
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<ScheduleTab>('all');
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);

  // 기수 선택이 없으면 첫 번째 기수 사용
  const activeCardinalId = selectedCardinalId ?? cardinals[0]?.id ?? null;
  const activeCardinal = cardinals.find((c) => c.id === activeCardinalId);

  const { data: schedules = [] } = useAdminSchedules(activeCardinalId);
  const { mutate: deleteSchedule } = useDeleteSchedule();

  // 월 필터링
  const monthFiltered = schedules.filter((s) => {
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

  const handleDelete = (schedule: Schedule) => {
    setDeleteTarget(schedule);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteSchedule(deleteTarget.scheduleId);
    setDeleteTarget(null);
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
              <Button variant="primary" size="lg">
                <Icon src={AdminCalendarEditIcon} size={20} className="text-text-inverse mr-1" />
                일반 일정 생성
              </Button>
            </div>

            {/* Schedule list */}
            <ScheduleList schedules={sortedSchedules} onDelete={handleDelete} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        status="danger"
        title="일정을 삭제하시겠습니까?"
        description="삭제된 일정은 복구할 수 없습니다."
      >
        <AlertDialogAction onClick={handleConfirmDelete}>삭제</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </div>
  );
}

export { SchedulePageContent };
