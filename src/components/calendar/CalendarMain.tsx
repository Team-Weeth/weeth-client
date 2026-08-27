'use client';

import { cn } from '@/lib/cn';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { CalendarFilter } from '@/components/calendar/CalendarFilter';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarMini } from '@/components/calendar/CalendarMini';
import { CalendarUpcomingPanel } from '@/components/calendar/CalendarUpcomingPanel';
import { CalendarAttendancePanel } from '@/components/calendar/CalendarAttendancePanel';
import { CardinalDropdown } from '@/components/common';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarFilters,
  useCalendarActions,
} from '@/stores/useCalendarStore';
import type { CalendarSchedule } from '@/types/calendar';

// TODO: 유저 사이드 일정 API 연결 시 제거
const MOCK_SCHEDULES: CalendarSchedule[] = [
  {
    id: 1,
    title: '8기 1차 세션',
    start: '2026-08-05T19:00:00',
    end: '2026-08-05T22:00:00',
    type: 'SESSION',
    location: '서울대학교 302호',
  },
  {
    id: 2,
    title: '8기 2차 세션',
    start: '2026-08-12T19:00:00',
    end: '2026-08-12T22:00:00',
    type: 'SESSION',
    location: '홍익대학교 본관',
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
  // Sep
  {
    id: 10,
    title: '9기 1차 세션',
    start: '2026-09-02T19:00:00',
    end: '2026-09-02T22:00:00',
    type: 'SESSION',
    location: '고려대학교 정경관',
  },
  {
    id: 11,
    title: '개강총회',
    start: '2026-09-05T16:00:00',
    end: '2026-09-05T19:00:00',
    type: 'EVENT',
    location: '홍대 라운지',
  },
];

interface CalendarMainProps {
  className?: string;
}

function CalendarMain({ className }: CalendarMainProps) {
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { sessionEnabled, eventEnabled, attendanceOnly } = useCalendarFilters();
  const { toggleDate } = useCalendarActions();

  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });

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
          <h2 className="typo-h2 text-text-normal flex-1">캘린더</h2>
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
          <CalendarMini />
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
            className="min-w-0 flex-1"
          />
          <div className="desktop:flex hidden flex-col gap-300">
            <CalendarUpcomingPanel schedules={filteredSchedules} />
            <CalendarAttendancePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export { CalendarMain, type CalendarMainProps };
