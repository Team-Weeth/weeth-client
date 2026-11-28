import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { ScheduleTag } from '@/components/admin/schedule/general/ScheduleTag';
import { ScheduleDeleteAlertDialog } from '@/components/admin/schedule/modal/ScheduleDeleteAlertDialog';
import { SCHEDULE_TYPE_LABEL } from '@/constants/admin/schedule.constants';
import type { Schedule } from '@/types/admin/schedule';
import { getDayLabel, getDayOfMonth, formatScheduleDateTime } from '@/utils/admin/scheduleUtils';
import { isSessionInProgress } from '@/utils/admin/sessionUtils';

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
  const day = getDayOfMonth(schedule.start);
  const dayLabel = getDayLabel(schedule.start);
  const dateTimeText = formatScheduleDateTime(schedule.start);

  return (
    <div
      className={cn(
        'border-line tablet:gap-600 tablet:pl-500 tablet:pr-600 tablet:py-400 flex items-center gap-400 px-400 py-300',
        !isLast && 'border-b',
        className,
      )}
      {...props}
    >
      {/* Date column */}
      <div className="flex w-11 shrink-0 flex-col items-center justify-center gap-100 self-stretch">
        <span className="typo-h3 text-text-alternative">{day ?? '-'}</span>
        <span className="typo-body2 text-text-alternative">{dayLabel}</span>
      </div>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-200 self-stretch">
        <span className="typo-sub3 text-text-strong">{schedule.title}</span>
        <div className="flex flex-wrap items-center gap-200">
          <ScheduleTag variant="type">{SCHEDULE_TYPE_LABEL[schedule.type]}</ScheduleTag>
          <ScheduleTag icon="calendar">{dateTimeText}</ScheduleTag>
          {schedule.location && <ScheduleTag icon="location">{schedule.location}</ScheduleTag>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="tablet:flex-row tablet:items-center flex shrink-0 flex-col items-stretch gap-200">
        <Button variant="secondary" size="sm" className="text-text-strong" onClick={onEdit}>
          수정
        </Button>
        <ScheduleDeleteAlertDialog
          trigger={
            <Button variant="danger" size="sm">
              삭제
            </Button>
          }
          scheduleType={schedule.type}
          inProgress={schedule.type === 'SESSION' && isSessionInProgress(schedule.start)}
          onConfirm={() => onDelete?.()}
        />
      </div>
    </div>
  );
}

export { ScheduleItem, type ScheduleItemProps };
