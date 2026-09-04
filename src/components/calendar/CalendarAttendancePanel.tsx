import Link from 'next/link';

import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface CalendarAttendancePanelProps {
  clubId: string | null;
  className?: string;
  attendanceRate?: number;
  totalCount?: number;
}

function CalendarAttendancePanel({
  clubId,
  className,
  attendanceRate = 0,
  totalCount = 0,
}: CalendarAttendancePanelProps) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex shrink-0 flex-col self-stretch rounded-md px-[14px] py-[14px]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="typo-caption1 text-text-normal">출석률</span>
        {clubId && (
          <Link href={`/${clubId}/attendance`} className="flex items-center gap-[2px]">
            <span className="typo-caption2 text-brand-primary">출석 페이지</span>
            <div className="flex items-center p-100">
              <Icon src={ArrowRightIcon} size={10} className="text-brand-primary" />
            </div>
          </Link>
        )}
      </div>

      {/* Percentage + total count */}
      <div className="flex items-end justify-between pt-600">
        <span className="typo-h3 text-text-strong">{attendanceRate}%</span>
        <span className="typo-caption2 text-text-alternative">총 {totalCount}회</span>
      </div>

      {/* Progress bar */}
      <div className="pt-200">
        <div className="bg-container-neutral-alternative h-[6px] w-full overflow-hidden rounded-full">
          <div
            className="bg-brand-primary h-full rounded-full"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export { CalendarAttendancePanel, type CalendarAttendancePanelProps };
