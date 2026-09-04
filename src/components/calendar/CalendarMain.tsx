'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { CalendarFilter } from '@/components/calendar/CalendarFilter';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarMini } from '@/components/calendar/CalendarMini';
import { CalendarUpcomingPanel } from '@/components/calendar/CalendarUpcomingPanel';
import { CalendarAttendancePanel } from '@/components/calendar/CalendarAttendancePanel';
import { CardinalDropdown } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarFilters,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import { useClubId } from '@/stores';
import type { CalendarSchedule } from '@/types/calendar';
import { CalendarScheduleModal } from '@/components/calendar/CalendarScheduleModal';
import type { ScheduleDetail } from '@/types/calendar';

// TODO: 유저 사이드 일정 API 연결 시 제거
const MOCK_SCHEDULES: ScheduleDetail[] = [
  {
    id: 1,
    title: '8기 1차 세션',
    start: '2026-08-05T19:00:00',
    end: '2026-08-05T22:00:00',
    type: 'SESSION',
    location: '서울대학교 302호',
    host: { name: '김위스' },
    attendees: [
      { name: '홍길동', department: '컴퓨터공학과', position: '부회장' },
      { name: '이영희', department: '전기전자공학과', position: '회원' },
      { name: '박민준', department: '소프트웨어학과', position: '회원' },
      { name: '최지우', department: '산업공학과', position: '회원' },
      { name: '강동현', department: '기계공학과', position: '회원' },
      { name: '김서연', department: '컴퓨터공학과', position: '회원' },
      { name: '이준호', department: '수학과', position: '회원' },
      { name: '정다은', department: '경영학과', position: '회원' },
      { name: '윤지훈', department: '물리학과', position: '회원' },
      { name: '오소현', department: '화학공학과', position: '회원' },
      { name: '한민재', department: '건축학과', position: '회원' },
      { name: '서은지', department: '심리학과', position: '회원' },
      { name: '임도윤', department: '통계학과', position: '회원' },
      { name: '백지아', department: '생명과학과', position: '회원' },
      { name: '노태양', department: '신소재공학과', position: '회원' },
      { name: '문채원', department: '미디어학과', position: '회원' },
      { name: '안재원', department: '전자공학과', position: '회원' },
      { name: '류하은', department: '영어영문학과', position: '회원' },
      { name: '곽준혁', department: '경제학과', position: '회원' },
      { name: '신보라', department: '디자인학과', position: '회원' },
    ],
    attendeeCount: 20,
    dDay: -28,
    hasAttendanceCheck: true,
    attendanceStatus: 'completed',
    attendanceCompletedAt: '2026-08-05T19:12:00',
    description: '위스 8기 첫 번째 세션입니다. React 기초와 컴포넌트 설계를 다룹니다.',
  },
  {
    id: 2,
    title: '8기 2차 세션',
    start: '2026-08-12T19:00:00',
    end: '2026-08-12T22:00:00',
    type: 'SESSION',
    location: '홍익대학교 본관',
    dDay: -22,
    hasAttendanceCheck: true,
    attendanceStatus: 'absent',
  },
  {
    id: 3,
    title: '8기 3차 세션',
    start: '2026-08-19T19:00:00',
    end: '2026-08-19T22:00:00',
    type: 'SESSION',
    location: '연세대학교 공학관',
  },
  {
    id: 4,
    title: '8기 4차 세션',
    start: '2026-08-26T19:00:00',
    end: '2026-08-26T22:00:00',
    type: 'SESSION',
    location: '서울시립대학교',
  },
  {
    id: 5,
    title: 'OT',
    start: '2026-08-03T14:00:00',
    end: '2026-08-03T17:00:00',
    type: 'EVENT',
    location: '강남 토즈',
  },
  {
    id: 6,
    title: '해커톤',
    start: '2026-08-10T10:00:00',
    end: '2026-08-11T18:00:00',
    type: 'EVENT',
    location: '서울시청',
  },
  {
    id: 7,
    title: '팀 미팅',
    start: '2026-08-26T11:00:00',
    end: '2026-08-26T12:00:00',
    type: 'EVENT',
  },
  {
    id: 8,
    title: '전체 회의',
    start: '2026-08-27T10:00:00',
    end: '2026-08-27T12:00:00',
    type: 'EVENT',
  },
  {
    id: 9,
    title: '수료식',
    start: '2026-08-31T18:00:00',
    end: '2026-08-31T21:00:00',
    type: 'EVENT',
    location: '강남구청',
  },
  // Aug 30
  {
    id: 12,
    title: '8기 5차 세션',
    start: '2026-08-30T19:00:00',
    end: '2026-08-30T22:00:00',
    type: 'SESSION',
    location: '서울대학교 302호',
  },
  {
    id: 13,
    title: '스터디 모임',
    start: '2026-08-30T14:00:00',
    end: '2026-08-30T16:00:00',
    type: 'SESSION',
    location: '강남 토즈',
  },
  {
    id: 14,
    title: '종강 파티',
    start: '2026-08-30T18:00:00',
    end: '2026-08-30T21:00:00',
    type: 'EVENT',
    location: '홍대 클럽',
  },
  {
    id: 15,
    title: '팀 회고',
    start: '2026-08-30T10:00:00',
    end: '2026-08-30T12:00:00',
    type: 'EVENT',
  },
  {
    id: 16,
    title: '디자인 리뷰',
    start: '2026-08-30T13:00:00',
    end: '2026-08-30T14:00:00',
    type: 'EVENT',
    location: '온라인',
  },
  {
    id: 17,
    title: '멘토링',
    start: '2026-08-30T16:00:00',
    end: '2026-08-30T17:00:00',
    type: 'SESSION',
    location: '위스',
  },
  {
    id: 18,
    title: '코드 리뷰',
    start: '2026-08-23T14:00:00',
    end: '2026-08-23T16:00:00',
    type: 'SESSION',
    location: '온라인',
  },
  // Sep
  {
    id: 10,
    title: '9기 1차 세션',
    start: '2026-09-02T19:00:00',
    end: '2026-09-02T22:00:00',
    type: 'SESSION',
    location: '고려대학교 정경관',
    host: { name: '이위스' },
    attendees: [
      { name: '홍길동' },
      { name: '이영희' },
      { name: '박민준' },
      { name: '최지우' },
      { name: '강동현' },
    ],
    attendeeCount: 23,
    dDay: 0,
    hasAttendanceCheck: true,
    attendanceStatus: 'available',
    description: '위스 9기 첫 번째 세션입니다. Next.js 15와 App Router를 다룹니다.',
  },
  {
    id: 20,
    title: '9기 2차 세션',
    start: '2026-09-09T19:00:00',
    end: '2026-09-09T22:00:00',
    type: 'SESSION',
    location: '연세대학교 공학관',
    host: { name: '이위스' },
    dDay: 6,
    hasAttendanceCheck: true,
    attendanceStatus: 'pending',
    description: '위스 9기 두 번째 세션입니다. TypeScript 심화와 상태 관리를 다룹니다.',
  },
  {
    id: 11,
    title: '개강총회',
    start: '2026-09-05T16:00:00',
    end: '2026-09-05T19:00:00',
    type: 'EVENT',
    location: '홍대 라운지',
    host: { name: '박위스' },
    attendees: [{ name: '홍길동' }, { name: '이영희' }, { name: '박민준' }],
    attendeeCount: 45,
    dDay: 3,
    description: '9기 개강총회입니다. 전체 일정 안내 및 팀 빌딩을 진행합니다.',
  },
];

interface CalendarMainProps {
  className?: string;
}

function CalendarMain({ className }: CalendarMainProps) {
  const clubId = useClubId();
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { sessionEnabled, eventEnabled, attendanceOnly } = useCalendarFilters();
  const { toggleDate, reset } = useCalendarActions();

  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDetail | null>(null);

  const schedules = MOCK_SCHEDULES.filter((s) => {
    const scheduleMonth = Number(s.start.split('-')[1]);
    const scheduleYear = Number(s.start.split('-')[0]);
    return scheduleYear === year && scheduleMonth === month;
  });

  const filteredSchedules = schedules.filter((s) => {
    if (attendanceOnly) return s.type === 'SESSION';
    if (s.type === 'SESSION' && !sessionEnabled) return false;
    if (s.type === 'EVENT' && !eventEnabled) return false;
    return true;
  });

  const eventDates = filteredSchedules.map((s) => new Date(s.start));

  const handleScheduleClick = (schedule: CalendarSchedule) => {
    setSelectedSchedule(schedule);
  };

  return (
    <div
      className={cn('flex flex-col gap-[35px] self-stretch px-[64px] pt-450 pb-[80px]', className)}
    >
      {/* Page header */}
      <div className="flex flex-col gap-200 px-450">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="typo-caption1 text-text-alternative">
                캘린더
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center">
          <div className="flex flex-1 items-center gap-200">
            <h2 className="typo-h2 text-text-normal">캘린더</h2>
            <Button variant="outlined" size="sm" onClick={reset}>
              오늘
            </Button>
          </div>
          <CardinalDropdown
            cardinals={cardinals}
            activeCardinal={activeCardinal}
            onSelect={setSelectedCardinalId}
          />
        </div>
      </div>

      {/* Main content: left column (mini + filter) + right column (grid & schedule) */}
      <div className="flex items-start gap-400">
        {/* Left column */}
        <div className="flex flex-col gap-300">
          <CalendarMini eventDates={eventDates} />
          <CalendarFilter />
        </div>

        {/* Right column */}
        <div className="flex flex-1 items-start gap-400">
          <CalendarGrid
            year={year}
            month={month}
            schedules={filteredSchedules}
            selectedDate={selectedDate}
            onSelectDate={toggleDate}
            onScheduleClick={handleScheduleClick}
            className="min-w-0 flex-1"
          />
          <div className="desktop:flex hidden flex-col gap-300">
            <CalendarUpcomingPanel
              schedules={filteredSchedules}
              onScheduleClick={handleScheduleClick}
            />
            <CalendarAttendancePanel clubId={clubId} />
          </div>
        </div>
      </div>
      <CalendarScheduleModal
        open={selectedSchedule !== null}
        onOpenChange={(open) => !open && setSelectedSchedule(null)}
        schedule={selectedSchedule}
        clubId={clubId}
      />
    </div>
  );
}

export { CalendarMain, type CalendarMainProps };
