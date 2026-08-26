import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ArrowRightIcon } from '@/assets/icons';
import { formatSessionDateParts, formatTimeDisplay } from '@/utils/shared/date';
import type { CalendarSchedule } from '@/types/calendar';

const DOT_COLOR: Record<string, string> = {
  SESSION: 'bg-brand-primary',
  EVENT: 'bg-state-success',
};

interface CalendarUpcomingPanelProps {
  schedules: CalendarSchedule[];
  className?: string;
}

function CalendarUpcomingPanel({ schedules, className }: CalendarUpcomingPanelProps) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex h-[346px] w-[271px] shrink-0 self-stretch flex-col items-start rounded-md px-[14px] pt-[14px] pb-200',
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-[26px] w-[243px] shrink-0 items-center justify-between pb-200">
        <span className="typo-caption1 text-text-normal">다가오는 일정</span>
        <span className="typo-caption2 text-text-alternative">이번 주</span>
      </div>

      {/* CalendarSchedule list */}
      <div className="flex flex-col">
        {schedules.length === 0 ? (
          <p className="typo-caption2 text-text-alternative py-500 text-center">일정이 없습니다.</p>
        ) : (
          schedules.map((schedule) => <UpcomingItem key={schedule.id} schedule={schedule} />)
        )}
      </div>
    </div>
  );
}

function UpcomingItem({ schedule }: { schedule: CalendarSchedule }) {
  const { day, weekday } = formatSessionDateParts(schedule.start);
  const timeStr = schedule.start.split('T')[1]?.slice(0, 5) ?? '';
  const timeLabel = formatTimeDisplay(timeStr);
  const dotColor = DOT_COLOR[schedule.type] ?? 'bg-brand-primary';

  return (
    <div className="flex items-center gap-[7px] rounded-md p-200">
      {/* Date column */}
      <div className="flex w-[32px] shrink-0 flex-col items-center justify-center gap-100 self-stretch">
        <span className="typo-sub3 text-text-alternative w-[28px] text-center">{day}</span>
        <span className="typo-caption2 text-text-alternative">{weekday}</span>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-200">
        {/* Title row */}
        <div className="flex items-center gap-[6px] overflow-hidden">
          <span className={cn('size-[6px] shrink-0 rounded-full', dotColor)} />
          <span className="typo-button2 text-text-normal truncate">{schedule.title}</span>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-100">
          {schedule.location && (
            <span className="typo-caption1 text-text-alternative bg-text-alternative/10 max-w-[92px] truncate rounded-sm px-200 py-100">
              {schedule.location}
            </span>
          )}
          <span className="typo-caption1 text-text-alternative bg-text-alternative/10 shrink-0 rounded-sm px-200 py-100">
            {timeLabel}
          </span>
        </div>
      </div>

      {/* Forward icon */}
      <div className="shrink-0 p-100">
        <Image
          src={ArrowRightIcon}
          alt=""
          width={7}
          height={12}
          className="text-icon-alternative"
        />
      </div>
    </div>
  );
}

export { CalendarUpcomingPanel, type CalendarUpcomingPanelProps };
