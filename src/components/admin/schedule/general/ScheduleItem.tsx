import { cn } from '@/lib/cn';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, Button } from '@/components/ui';
import { ScheduleTag } from '@/components/admin/schedule/general/ScheduleTag';
import { SCHEDULE_TYPE_LABEL } from '@/constants/admin/schedule.constants';
import type { Schedule } from '@/types/admin/schedule';
import { getDayLabel, getDayOfMonth, formatScheduleDateTime } from '@/utils/admin/scheduleUtils';

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
        'border-line flex items-start gap-600 px-500 py-400',
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
      <div className="flex flex-1 flex-col justify-center gap-200 self-stretch">
        <span className="typo-sub3 text-text-strong">{schedule.title}</span>
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
        <AlertDialog
          status="danger"
          title="이 일정을 삭제하시겠어요?"
          description={'삭제된 일정은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
          trigger={
            <Button variant="danger" size="md">
              삭제
            </Button>
          }
        >
          <AlertDialogAction onClick={onDelete}>삭제</AlertDialogAction>
          <AlertDialogCancel>취소</AlertDialogCancel>
        </AlertDialog>
      </div>
    </div>
  );
}

export { ScheduleItem, type ScheduleItemProps };
