'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ArrowRightIcon } from '@/assets/icons';
import { formatSessionDateParts } from '@/utils/shared/date';
import type { CalendarSchedule } from '@/types/calendar';

const DOT_COLOR: Record<string, string> = {
  SESSION: 'bg-brand-primary',
  EVENT: 'bg-state-success',
};

interface CalendarUpcomingPanelProps {
  schedules: CalendarSchedule[];
  onScheduleClick?: (schedule: CalendarSchedule) => void;
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
        'bg-container-neutral flex max-h-[346px] shrink-0 flex-col items-start self-stretch rounded-md px-[14px] pt-[14px] pb-200',
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-[26px] w-[243px] shrink-0 items-center justify-between pb-200">
        <span className="typo-caption1 text-text-normal">다가오는 일정</span>
        <span className="typo-caption2 text-text-alternative">이번 주</span>
      </div>

      {/* CalendarSchedule list */}
      <div className="scrollbar-custom flex w-full flex-1 flex-col gap-200 overflow-y-auto">
        {schedules.length === 0 ? (
          <p className="typo-caption2 text-text-alternative w-[245px] py-500 text-center">
            일정이 없습니다.
          </p>
        ) : (
          schedules.map((schedule) => (
            <UpcomingItem key={schedule.id} schedule={schedule} onScheduleClick={onScheduleClick} />
          ))
        )}
      </div>
    </div>
  );
}

function UpcomingItem({
  schedule,
  onScheduleClick,
}: {
  schedule: CalendarSchedule;
  onScheduleClick?: (schedule: CalendarSchedule) => void;
}) {
  const { day, weekday, timeLabel } = formatSessionDateParts(schedule.start);
  const dotColor = DOT_COLOR[schedule.type] ?? 'bg-brand-primary';

  return (
    <button
      type="button"
      onClick={() => onScheduleClick?.(schedule)}
      className="hover:bg-container-neutral-interaction flex w-[245px] cursor-pointer items-center gap-[7px] rounded-[7px] p-200 transition-colors"
    >
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
          <span className="typo-caption1 text-text-normal truncate">{schedule.title}</span>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-100">
          {schedule.location && <TruncatedTag label={schedule.location} />}
          <TruncatedTag label={timeLabel} />
        </div>
      </div>

      {/* Forward icon */}
      <Icon src={ArrowRightIcon} size={10} className="text-icon-alternative shrink-0" />
    </button>
  );
}

function TruncatedTag({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <Tag
            ref={ref as React.Ref<HTMLSpanElement>}
            className="bg-text-alternative/10 text-text-alternative block max-w-[92px] truncate"
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
    </TooltipProvider>
  );
}

export { CalendarUpcomingPanel, type CalendarUpcomingPanelProps };
