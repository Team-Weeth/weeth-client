'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
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
        'bg-container-neutral flex max-h-[346px] w-[273px] shrink-0 flex-col items-start rounded-md px-[14px] pt-[14px] pb-200',
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-[26px] w-full shrink-0 items-center justify-between pb-200">
        <span className="typo-caption1 text-text-normal">다가오는 일정</span>
        <span className="typo-caption2 text-text-alternative">이번 주</span>
      </div>

      {/* CalendarSchedule list */}
      <TooltipProvider>
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
      </TooltipProvider>
    </div>
  );
}

interface UpcomingItemProps {
  schedule: ScheduleDetail;
  onScheduleClick?: (schedule: ScheduleDetail) => void;
  showDateColumn?: boolean;
}

const SOFT_TAG_CLASS = 'bg-text-alternative/10 text-text-alternative';

function UpcomingItem({ schedule, onScheduleClick, showDateColumn = true }: UpcomingItemProps) {
  const { day, weekday, time } = formatSessionDateParts(schedule.start);
  const dotColor = SCHEDULE_DOT_COLOR[schedule.type] ?? 'bg-brand-primary';

  return (
    <button
      type="button"
      onClick={() => onScheduleClick?.(schedule)}
      className={cn(
        'hover:bg-container-neutral-interaction flex cursor-pointer items-center rounded-[7px] transition-colors',
        showDateColumn ? 'w-full gap-[7px] p-200' : 'justify-between self-stretch px-200 py-300',
      )}
    >
      {showDateColumn && (
        <div className="flex w-[32px] shrink-0 flex-col items-center justify-center gap-100 self-stretch">
          <span className="typo-sub3 text-text-alternative w-[28px] text-center">{day}</span>
          <span className="typo-caption2 text-text-alternative">{weekday}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-200">
        {/* Title row */}
        <div className="flex items-center gap-[6px] overflow-hidden">
          <span className={cn('size-[6px] shrink-0 rounded-full', dotColor)} />
          <span
            className={cn(
              'text-text-normal',
              showDateColumn ? 'typo-caption1 truncate' : 'typo-button2 whitespace-nowrap',
            )}
          >
            {schedule.title}
          </span>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-100">
          {showDateColumn ? (
            <>
              {schedule.location && <TruncatedTag label={schedule.location} constrained />}
              <TruncatedTag label={time} />
            </>
          ) : (
            <>
              {schedule.location && <Tag className={SOFT_TAG_CLASS}>{schedule.location}</Tag>}
              <Tag className={SOFT_TAG_CLASS}>{time}</Tag>
            </>
          )}
        </div>
      </div>

      {/* Forward icon */}
      <Icon src={ArrowRightIcon} size={10} className="text-icon-alternative shrink-0" />
    </button>
  );
}

function TruncatedTag({ label, constrained = false }: { label: string; constrained?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <Tag
          ref={ref as React.Ref<HTMLSpanElement>}
          className={cn(SOFT_TAG_CLASS, constrained ? 'block max-w-[92px] truncate' : 'shrink-0')}
          onMouseEnter={() => {
            if (ref.current && ref.current.scrollWidth > ref.current.clientWidth) {
              setOpen(true);
            }
          }}
          onMouseLeave={() => setOpen(false)}
        >
          {label}
        </Tag>
      </TooltipTrigger>
      <TooltipContent variant="sm">{label}</TooltipContent>
    </Tooltip>
  );
}

export { CalendarUpcomingPanel, UpcomingItem, type CalendarUpcomingPanelProps };
