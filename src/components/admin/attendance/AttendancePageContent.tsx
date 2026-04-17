'use client';

import { useState } from 'react';
import Image from 'next/image';

import { ArrowDownIcon } from '@/assets/icons';
import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useCardinals } from '@/hooks/queries';

import { AttendanceCard } from './AttendanceCard';
import type { AttendanceMember } from '@/types/admin/attendance';

const MOCK_MEMBERS: AttendanceMember[] = [
  {
    id: 1,
    name: '조예진',
    department: '시각디자인학과',
    studentId: '202036191',
    status: 'PENDING',
  },
  {
    id: 2,
    name: '조예진',
    department: '시각디자인학과',
    studentId: '202036191',
    status: 'ATTEND',
  },
  {
    id: 3,
    name: '조예진',
    department: '시각디자인학과',
    studentId: '202036191',
    status: 'ABSENT',
  },
];

interface MockSchedule {
  id: number;
  date: string;
  title: string;
  isCurrentWeek?: boolean;
}

const MOCK_SCHEDULES: MockSchedule[] = [
  { id: 1, date: '2024년 11월 25일', title: '1주차 정기모임', isCurrentWeek: true },
  { id: 2, date: '2024년 11월 25일', title: '1주차 정기모임', isCurrentWeek: true },
  { id: 3, date: '2024년 11월 25일', title: '1주차 정기모임' },
  { id: 4, date: '2024년 11월 25일', title: '1주차 정기모임' },
  { id: 5, date: '2024년 11월 25일', title: '1주차 정기모임' },
  { id: 6, date: '2024년 11월 25일', title: '1주차 정기모임' },
];

function AttendancePageContent() {
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);

  const activeCardinal = selectedCardinalId
    ? cardinals.find((c) => c.id === selectedCardinalId)
    : undefined;

  return (
    <div className="flex min-w-3xl flex-col gap-400 p-700">
      {/* Cardinal dropdown */}
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

      {/* Cards */}
      <Card className="mt-400 gap-400 px-600 pt-600 pb-[64px]">
        {MOCK_SCHEDULES.map((schedule) => (
          <AttendanceCard
            key={schedule.id}
            date={schedule.date}
            title={schedule.title}
            isCurrentWeek={schedule.isCurrentWeek}
            members={MOCK_MEMBERS}
          />
        ))}
      </Card>
    </div>
  );
}

export { AttendancePageContent };
