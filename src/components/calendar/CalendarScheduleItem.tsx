import { cn } from '@/lib/cn';
import { formatKoreanTimeRange } from '@/utils/shared/date';
import type { MonthlySchedule } from '@/types/home';

type ScheduleType = MonthlySchedule['type'];

/** Maps schedule type to brand color token */
const SCHEDULE_TYPE_COLOR: Record<string, string> = {
  SESSION: 'bg-brand-primary',
  EVENT: 'bg-brand-secondary',
};

const DEFAULT_COLOR = 'bg-brand-primary';

interface CalendarScheduleItemProps {
  schedule: MonthlySchedule;
  className?: string;
}

function CalendarScheduleItem({ schedule, className }: CalendarScheduleItemProps) {
  const accentColor = SCHEDULE_TYPE_COLOR[schedule.type as ScheduleType] ?? DEFAULT_COLOR;

  return (
    <div
      className={cn(
        'bg-container-neutral-alternative flex items-stretch gap-300 rounded-md py-300 pr-300 pl-200',
        className,
      )}
    >
      <div className={cn('w-[4px] shrink-0 self-stretch rounded-full', accentColor)} />
      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <p className="typo-sub3 text-text-strong truncate">{schedule.title}</p>
        <p className="typo-caption2 text-text-alternative">
          {formatKoreanTimeRange(schedule.start, schedule.end)}
        </p>
      </div>
    </div>
  );
}

export { CalendarScheduleItem, type CalendarScheduleItemProps };
