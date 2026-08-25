'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useMonthNavigator } from '@/hooks/useMonthNavigator';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useAdminMonthlySchedules } from '@/hooks/queries/admin/useAdminScheduleQueries';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarScheduleList } from '@/components/calendar/CalendarScheduleList';
import { CardinalDropdown } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Skeleton,
} from '@/components/ui';

interface CalendarMainProps {
  className?: string;
}

function CalendarMain({ className }: CalendarMainProps) {
  const { year, month, prev, next } = useMonthNavigator();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });

  const { data: schedules = [], isLoading } = useAdminMonthlySchedules(year, month);

  const handlePrevMonth = () => {
    setSelectedDate(null);
    prev();
  };

  const handleNextMonth = () => {
    setSelectedDate(null);
    next();
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date));
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
              <BreadcrumbPage className="typo-caption1 text-text-alternative">캘린더</BreadcrumbPage>
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

      {/* Month navigator */}
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Calendar grid */}
      <CalendarGrid
        year={year}
        month={month}
        schedules={schedules}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {/* Divider */}
      <div className="bg-line h-px w-full" />

      {/* Schedule list */}
      {isLoading ? (
        <CalendarMainSkeleton />
      ) : (
        <CalendarScheduleList schedules={schedules} filterDate={selectedDate} />
      )}
    </div>
  );
}

function CalendarMainSkeleton() {
  return (
    <div className="flex flex-col gap-500 px-500 pt-500">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-200">
          <Skeleton className="h-5 w-32 rounded-sm" />
          <Skeleton className="h-14 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

export { CalendarMain, CalendarMainSkeleton, type CalendarMainProps };
