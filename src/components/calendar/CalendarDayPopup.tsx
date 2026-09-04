'use client';

import { cn } from '@/lib/cn';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Icon } from '@/components/ui/Icon';
import DeleteIcon from '@/assets/icons/delete.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import type { CalendarSchedule } from '@/types/calendar';

const SCHEDULE_DOT_COLOR: Record<string, string> = {
  SESSION: 'bg-brand-primary',
  EVENT: 'bg-brand-secondary',
};

const MAX_VISIBLE_ITEMS = 6;

interface CalendarDayPopupProps {
  /** Formatted date label, e.g. "12월 17일" */
  date: string;
  schedules: CalendarSchedule[];
  onClose?: () => void;
  onScheduleClick?: (schedule: CalendarSchedule) => void;
  className?: string;
}

function CalendarDayPopup({
  date,
  schedules,
  onClose,
  onScheduleClick,
  className,
}: CalendarDayPopupProps) {
  const popupRef = useClickOutside<HTMLDivElement>(() => onClose?.());

  return (
    <div
      ref={popupRef}
      className={cn(
        'bg-container-neutral flex w-[244px] flex-col items-start rounded-md [box-shadow:var(--shadow-md)] dark:[box-shadow:0_5px_20px_0_rgba(0,0,0,0.80)]',
        className,
      )}
    >
      <div className="w-full p-[14px]">
        {/* Header: date/count + close button */}
        <div className="relative w-full pb-200">
          <div className="flex flex-col gap-100">
            <p className="typo-sub1 text-text-normal">{date}</p>
            <p className="typo-caption2 text-text-alternative">일정 {schedules.length}개</p>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute top-0 right-0 flex size-6 cursor-pointer items-center justify-center rounded-sm"
          >
            <Icon src={DeleteIcon} size={16} className="text-icon-normal" />
          </button>
        </div>

        {/* Event list: scroll after MAX_VISIBLE_ITEMS */}
        <div
          className={cn(
            'scrollbar-custom flex flex-col',
            schedules.length > MAX_VISIBLE_ITEMS && 'max-h-[216px] overflow-y-auto',
          )}
        >
          {schedules.map((schedule) => (
            <button
              key={schedule.id}
              type="button"
              onClick={() => onScheduleClick?.(schedule)}
              className="hover:bg-container-neutral-interaction flex w-full cursor-pointer items-center justify-between rounded-[7px] p-200"
            >
              <div className="flex min-w-0 flex-1 items-center gap-[6px] overflow-hidden">
                <span
                  className={cn(
                    'size-[6px] shrink-0 rounded-full',
                    SCHEDULE_DOT_COLOR[schedule.type] ?? 'bg-brand-primary',
                  )}
                />
                <span className="typo-button2 text-text-normal truncate">{schedule.title}</span>
              </div>
              <div className="flex shrink-0 items-center p-100">
                <Icon src={ArrowRightIcon} size={12} className="text-icon-alternative" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { CalendarDayPopup, type CalendarDayPopupProps };
