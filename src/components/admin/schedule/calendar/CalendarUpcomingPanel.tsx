'use client';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { SCHEDULE_DOT_COLOR } from '@/constants/calendar';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import { formatSessionDateParts } from '@/utils/shared/date';
import type { ScheduleDetail } from '@/types/calendar';

interface CalendarUpcomingPanelProps {
  schedules: ScheduleDetail[];
  onScheduleClick?: (schedule: ScheduleDetail) => void;
  className?: string;
}

function CalendarUpcomingPanel({
  schedules,
  onScheduleClick,
  className,
}: CalendarUpcomingPanelProps) {
  return (
    <div
      className={cn(
        'border-line bg-container-neutral flex w-full flex-col items-start gap-[14px] rounded-[15px] border px-400 py-450',
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-[26px] w-full shrink-0 items-center">
        <span className="typo-sub3 text-text-normal">다가오는 일정</span>
      </div>

      {/* Schedule list */}
      <div className="scrollbar-custom flex w-full flex-1 flex-col gap-200 overflow-y-auto">
        {schedules.length === 0 ? (
          <p className="typo-caption2 text-text-alternative w-full py-500 text-center">
            일정이 없습니다.
          </p>
        ) : (
          schedules.map((schedule) => (
            <UpcomingItem
              key={schedule.id}
              schedule={schedule}
              onScheduleClick={onScheduleClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

const SOFT_TAG_CLASS = 'typo-caption1 bg-text-alternative/10 text-text-alternative';

interface UpcomingItemProps {
  schedule: ScheduleDetail;
  onScheduleClick?: (schedule: ScheduleDetail) => void;
}

function UpcomingItem({ schedule, onScheduleClick }: UpcomingItemProps) {
  const { time } = formatSessionDateParts(schedule.start);
  const dotColor = SCHEDULE_DOT_COLOR[schedule.type] ?? 'bg-brand-primary';

  return (
    <button
      type="button"
      onClick={() => onScheduleClick?.(schedule)}
      className="hover:bg-container-neutral-interaction flex cursor-pointer items-center justify-between self-stretch rounded-[7px] px-200 py-300 transition-colors"
    >
      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-200">
        {/* Title row */}
        <div className="flex items-center gap-[6px] overflow-hidden">
          <span className={cn('size-[6px] shrink-0 rounded-full', dotColor)} />
          <span className="typo-button2 text-text-normal whitespace-nowrap">{schedule.title}</span>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-100">
          {schedule.location && <Tag className={SOFT_TAG_CLASS}>{schedule.location}</Tag>}
          <Tag className={SOFT_TAG_CLASS}>{time}</Tag>
        </div>
      </div>

      {/* Forward icon */}
      <Icon src={ArrowRightIcon} size={10} className="text-icon-alternative shrink-0" />
    </button>
  );
}

export { CalendarUpcomingPanel, type CalendarUpcomingPanelProps };
