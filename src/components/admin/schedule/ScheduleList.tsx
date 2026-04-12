import { cn } from '@/lib/cn';
import { ScheduleItem } from '@/components/admin/schedule/ScheduleItem';
import type { Schedule } from '@/types/admin/schedule';

interface ScheduleListProps extends React.HTMLAttributes<HTMLDivElement> {
  schedules: Schedule[];
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (schedule: Schedule) => void;
}

function ScheduleList({ className, schedules, onEdit, onDelete, ...props }: ScheduleListProps) {
  return (
    <div
      className={cn('border-line bg-container-neutral overflow-hidden rounded-sm border', className)}
      {...props}
    >
      {/* Table header */}
      <div className="bg-container-neutral-alternative border-line border-b px-400 py-300">
        <span className="typo-sub2 text-text-alternative">일정 내용</span>
      </div>

      {/* Schedule items */}
      {schedules.length === 0 ? (
        <div className="flex items-center justify-center py-800">
          <span className="typo-body1 text-text-alternative">일정이 없습니다.</span>
        </div>
      ) : (
        schedules.map((schedule, index) => (
          <ScheduleItem
            key={schedule.scheduleId}
            schedule={schedule}
            isLast={index === schedules.length - 1}
            onEdit={() => onEdit?.(schedule)}
            onDelete={() => onDelete?.(schedule)}
          />
        ))
      )}
    </div>
  );
}

export { ScheduleList, type ScheduleListProps };
