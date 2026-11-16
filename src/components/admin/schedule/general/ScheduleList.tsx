import { cn } from '@/lib/cn';
import { ScheduleItem } from '@/components/admin/schedule/general/ScheduleItem';
import type { Schedule } from '@/types/admin/schedule';

interface ScheduleListProps extends React.HTMLAttributes<HTMLDivElement> {
  schedules: Schedule[];
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (schedule: Schedule) => void;
}

function ScheduleList({ className, schedules, onEdit, onDelete, ...props }: ScheduleListProps) {
  return (
    <div
      className={cn(
        'border-line bg-container-neutral flex flex-col overflow-clip rounded-sm border',
        className,
      )}
      {...props}
    >
      <div className="bg-container-neutral-alternative border-line shrink-0 border-b px-400 py-300">
        <span className="typo-sub3 text-text-alternative">일정 내용</span>
      </div>

      <div className={cn(schedules.length > 0 && 'min-h-0 flex-1 overflow-y-auto')}>
        {schedules.length === 0 ? (
          <div className="flex h-[188px] items-center justify-center">
            <p className="typo-sub1 text-text-alternative text-center">아직 등록된 일정이 없어요</p>
          </div>
        ) : (
          schedules.map((schedule, index) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              isLast={index === schedules.length - 1}
              onEdit={() => onEdit?.(schedule)}
              onDelete={() => onDelete?.(schedule)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export { ScheduleList, type ScheduleListProps };
