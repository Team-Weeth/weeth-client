import { CalendarFilter } from '@/components/calendar/CalendarFilter';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarMini } from '@/components/calendar/CalendarMini';
import { CalendarUpcomingPanel } from '@/components/calendar/CalendarUpcomingPanel';
import { CalendarAttendancePanel } from '@/components/calendar/CalendarAttendancePanel';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarDesktopViewProps {
  year: number;
  month: number;
  filteredSchedules: ScheduleDetail[];
  selectedDate: string | null;
  eventDates: Date[];
  clubId: string | null;
  onSelectDate: (date: string) => void;
  onScheduleClick: (schedule: ScheduleDetail) => void;
  onCrossMonthDateClick: (dateStr: string, y: number, m: number) => void;
}

function CalendarDesktopView({
  year,
  month,
  filteredSchedules,
  selectedDate,
  eventDates,
  clubId,
  onSelectDate,
  onScheduleClick,
  onCrossMonthDateClick,
}: CalendarDesktopViewProps) {
  return (
    <div className="tablet:flex hidden items-start gap-400">
      <div className="flex flex-col gap-300">
        <CalendarMini eventDates={eventDates} />
        <CalendarFilter />
      </div>
      <div className="flex flex-1 items-start gap-400">
        <CalendarGrid
          year={year}
          month={month}
          schedules={filteredSchedules}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onScheduleClick={onScheduleClick}
          onCrossMonthDateClick={onCrossMonthDateClick}
          className="min-w-0 flex-1"
        />
        <div className="desktop:flex hidden flex-col gap-300">
          <CalendarUpcomingPanel schedules={filteredSchedules} onScheduleClick={onScheduleClick} />
          {/* TODO: attendanceRate={attendanceRate} totalCount={totalCount} 추가 */}
          <CalendarAttendancePanel clubId={clubId} />
        </div>
      </div>
    </div>
  );
}

export { CalendarDesktopView, type CalendarDesktopViewProps };
