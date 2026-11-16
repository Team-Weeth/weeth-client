'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { DropdownMenu } from 'radix-ui';
import { Button, buttonVariants } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { CalendarGrid } from '@/components/admin/schedule/calendar/CalendarGrid';
import { CalendarMini } from '@/components/admin/schedule/calendar/CalendarMini';
import { CalendarUpcomingPanel } from '@/components/admin/schedule/calendar/CalendarUpcomingPanel';
import { MonthNavigator } from '@/components/admin/schedule/general/MonthNavigator';
import AdminPlusIcon from '@/assets/icons/admin/ic_admin_plus.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import type { ScheduleType } from '@/types/admin/schedule';
import type { ScheduleDetail } from '@/types/calendar';

interface ScheduleCalendarSectionProps {
  year: number;
  month: number;
  calendarSchedules: ScheduleDetail[];
  selectedDate: string | null;
  eventDates: Date[];
  upcomingSchedules: ScheduleDetail[];
  isPending: boolean;
  isError: boolean;
  clubId: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onToggleDate: (dateStr: string) => void;
  onScheduleClick: (schedule: ScheduleDetail) => void;
  onCreateSchedule: (tab: ScheduleType) => void;
}

function ScheduleCalendarSection({
  year,
  month,
  calendarSchedules,
  selectedDate,
  eventDates,
  upcomingSchedules,
  isPending,
  isError,
  clubId,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onToggleDate,
  onScheduleClick,
  onCreateSchedule,
}: ScheduleCalendarSectionProps) {
  return (
    /* desktop: 2-col grid — MonthNav in [1,1], CalendarGrid in [2,1], side panel in [2,2] */
    <div className="desktop:grid desktop:[grid-template-columns:minmax(0,1fr)_auto] desktop:gap-x-400 desktop:gap-y-300 flex min-w-0 flex-col gap-300">
      {/* Month nav row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-500">
          <MonthNavigator year={year} month={month} onPrev={onPrevMonth} onNext={onNextMonth} />
          <button
            type="button"
            onClick={onGoToToday}
            className="border-line typo-caption1 text-text-normal flex cursor-pointer items-center justify-center rounded-full border px-300 py-200 transition-colors hover:border-neutral-500"
          >
            오늘
          </button>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="primary" size="md">
              <Icon src={AdminPlusIcon} size={20} className="text-text-inverse mr-1" />
              일정 생성
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="animate-in fade-in zoom-in-95 border-line bg-background z-20 flex flex-col items-start gap-200 rounded-lg border p-400 shadow-[0_10px_40px_0_rgba(0,0,0,0.40)] duration-150"
            >
              <DropdownMenu.Item asChild>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-[186px]"
                  onClick={() => onCreateSchedule('EVENT')}
                >
                  일반 일정
                </Button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-[186px]"
                  onClick={() => onCreateSchedule('SESSION')}
                >
                  세션
                </Button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* 일정 모아보기 (mobile) */}
      <Link
        href={`/${clubId}/admin/schedule/overview?year=${year}&month=${month}`}
        className={cn(
          buttonVariants({ variant: 'secondary', size: 'md' }),
          'tablet:hidden gap-100',
        )}
      >
        일정 모아보기
        <Icon src={ArrowRightIcon} size={10} />
      </Link>

      {/* Calendar grid */}
      {isPending ? (
        <div className="bg-container-neutral-alternative desktop:col-start-1 desktop:row-start-2 h-[636px] min-w-0 animate-pulse rounded-[15px]" />
      ) : isError ? (
        <div className="border-line bg-container-neutral desktop:col-start-1 desktop:row-start-2 flex h-[636px] min-w-0 items-center justify-center rounded-[15px] border shadow-sm">
          <span className="typo-body2 text-text-alternative">일정을 불러오지 못했습니다.</span>
        </div>
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          schedules={calendarSchedules}
          selectedDate={selectedDate}
          onSelectDate={onToggleDate}
          onScheduleClick={onScheduleClick}
          className="desktop:col-start-1 desktop:row-start-2 min-w-0"
        />
      )}

      {/* Desktop side panel */}
      <div className="tablet:flex desktop:col-start-2 desktop:row-start-2 desktop:max-h-[638px] desktop:self-start hidden flex-col items-start gap-500 self-stretch rounded-lg bg-neutral-200 p-500">
        <Link
          href={`/${clubId}/admin/schedule/overview?year=${year}&month=${month}`}
          className={cn(buttonVariants({ variant: 'secondary', size: 'md' }), 'w-full gap-100')}
        >
          일정 모아보기
          <Icon src={ArrowRightIcon} size={10} />
        </Link>

        <CalendarMini
          year={year}
          month={month}
          selectedDate={selectedDate}
          eventDates={eventDates}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onToggleDate={onToggleDate}
          className="desktop:flex hidden"
        />

        <CalendarUpcomingPanel schedules={upcomingSchedules} onScheduleClick={onScheduleClick} />
      </div>
    </div>
  );
}

export { ScheduleCalendarSection, type ScheduleCalendarSectionProps };
