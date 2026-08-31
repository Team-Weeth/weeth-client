import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { ScheduleItem } from '@/components/admin/schedule/general/ScheduleItem';
import type { Schedule } from '@/types/admin/schedule';

interface ScheduleListProps extends React.HTMLAttributes<HTMLDivElement> {
  schedules: Schedule[];
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (schedule: Schedule) => void;
  onCreateClick?: () => void;
}

function ScheduleList({
  className,
  schedules,
  onEdit,
  onDelete,
  onCreateClick,
  ...props
}: ScheduleListProps) {
  return (
    <div
      className={cn(
        'border-line bg-container-neutral overflow-hidden rounded-sm border',
        className,
      )}
      {...props}
    >
      <div className="bg-container-neutral-alternative border-line border-b px-400 py-300">
        <span className="typo-sub3 text-text-alternative">일정 내용</span>
      </div>

      {schedules.length === 0 ? (
        <div className="border-line flex h-[150px] flex-col items-center justify-center gap-200 border-b p-400">
          <p className="typo-body2 text-text-alternative">일정이 없습니다</p>
          <Button variant="secondary" size="lg" className="w-[308px]" onClick={onCreateClick}>
            일반 일정 생성하기
          </Button>
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
  );
}

export { ScheduleList, type ScheduleListProps };
