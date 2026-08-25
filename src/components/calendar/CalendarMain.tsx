'use client';

import { cn } from '@/lib/cn';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useAdminMonthlySchedules } from '@/hooks/queries/admin/useAdminScheduleQueries';
import { CalendarFilter } from '@/components/calendar/CalendarFilter';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarMini } from '@/components/calendar/CalendarMini';
import { CardinalDropdown } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui';
import {
  useCalendarYear,
  useCalendarMonth,
  useCalendarSelectedDate,
  useCalendarFilters,
  useCalendarActions,
} from '@/stores/useCalendarStore';

interface CalendarMainProps {
  className?: string;
}

function CalendarMain({ className }: CalendarMainProps) {
  const year = useCalendarYear();
  const month = useCalendarMonth();
  const selectedDate = useCalendarSelectedDate();
  const { sessionEnabled, eventEnabled } = useCalendarFilters();
  const { toggleDate } = useCalendarActions();

  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });

  const { data: schedules = [] } = useAdminMonthlySchedules(year, month);

  const filteredSchedules = schedules.filter((s) => {
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
        <div className="flex flex-1 flex-col gap-[35px]">
          <CalendarGrid
            year={year}
            month={month}
            schedules={filteredSchedules}
            selectedDate={selectedDate}
            onSelectDate={toggleDate}
          />

        </div>
      </div>
    </div>
  );
}

export { CalendarMain, type CalendarMainProps };
