import { cn } from '@/lib/cn';
import { formatKoreanDate, groupByStartDate } from '@/utils/shared/date';
import type { MonthlySchedule } from '@/types/home';
import { CalendarScheduleItem } from '@/components/calendar/CalendarScheduleItem';

interface CalendarScheduleListProps {
  schedules: MonthlySchedule[];
  /** If provided, only show schedules on this date (YYYY-MM-DD) */
  filterDate?: string | null;
  className?: string;
}

function CalendarScheduleList({ schedules, filterDate, className }: CalendarScheduleListProps) {
  const filtered = filterDate ? schedules.filter((s) => s.start.startsWith(filterDate)) : schedules;

  const dateGrouped = groupByStartDate(filtered);

  if (dateGrouped.length === 0) {
    return (
      <div className={cn('flex flex-1 items-center justify-center py-700', className)}>
        <p className="typo-body2 text-text-alternative text-center">일정이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-500 px-500 py-500', className)}>
      {dateGrouped.map(([dateKey, daySchedules]) => (
        <div key={dateKey} className="flex flex-col gap-200">
          <p className="typo-sub3 text-text-strong">{formatKoreanDate(daySchedules[0].start)}</p>
          <div className="flex flex-col gap-200">
            {daySchedules.map((schedule) => (
              <CalendarScheduleItem key={schedule.id} schedule={schedule} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { CalendarScheduleList, type CalendarScheduleListProps };
