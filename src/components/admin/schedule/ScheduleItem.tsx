import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';
import { ScheduleTag } from '@/components/admin/schedule/ScheduleTag';
import type { Schedule } from '@/types/admin/schedule';
import { getDayLabel, getDayOfMonth, formatScheduleDateTime } from '@/utils/admin/scheduleUtils';

const SCHEDULE_TYPE_LABEL: Record<Schedule['type'], string> = {
  SESSION: '세션',
  GENERAL: '일반 일정',
};

interface ScheduleItemProps extends React.HTMLAttributes<HTMLDivElement> {
  schedule: Schedule;
  isLast?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ScheduleItem({
  className,
  schedule,
  isLast = false,
  onEdit,
  onDelete,
  ...props
}: ScheduleItemProps) {
  const day = getDayOfMonth(schedule.startDateTime);
  const dayLabel = getDayLabel(schedule.startDateTime);
  const dateTimeText = formatScheduleDateTime(schedule.startDateTime);

  return (
    <div
      className={cn(
        'border-line flex items-start gap-600 px-500 py-400',
        !isLast && 'border-b',
        className,
      )}
      {...props}
    >
      {/* Date column */}
      <div className="flex w-11 shrink-0 flex-col items-center justify-center gap-100 self-stretch">
        <span className="typo-h3 text-text-alternative">{day}</span>
        <span className="typo-body2 text-text-alternative">{dayLabel}</span>
      </div>

      {/* Content column */}
      <div className="flex flex-1 flex-col justify-center gap-200 self-stretch">
        <span className="typo-sub2 text-text-strong">{schedule.title}</span>
        <div className="flex flex-wrap items-center gap-200">
          <ScheduleTag variant="type">{SCHEDULE_TYPE_LABEL[schedule.type]}</ScheduleTag>
          <ScheduleTag icon="calendar">{dateTimeText}</ScheduleTag>
          {schedule.location && <ScheduleTag icon="location">{schedule.location}</ScheduleTag>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-200">
        <Button variant="secondary" size="md" onClick={onEdit}>
          수정
        </Button>
        <Button variant="danger" size="md" onClick={onDelete}>
          삭제
        </Button>
      </div>
    </div>
  );
}

export { ScheduleItem, type ScheduleItemProps };
