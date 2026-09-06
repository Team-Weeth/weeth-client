import { Skeleton } from '@/components/ui';
import {
  SESSION_TABLE_COLUMNS,
  SESSION_TABLE_MIN_WIDTH,
} from '@/components/admin/schedule/session/sessionTableColumns';

function SessionTableSkeleton() {
  return (
    <div className="border-line overflow-x-auto rounded-sm border">
      <div className="w-full" style={{ minWidth: SESSION_TABLE_MIN_WIDTH }}>
        <div className="bg-container-neutral-alternative border-line flex w-full items-center border-b">
          <div className={SESSION_TABLE_COLUMNS.titleSticky.widthClass}>
            <Skeleton className="mx-400 my-[15px] h-5 w-20" />
          </div>
          <div className={SESSION_TABLE_COLUMNS.date.widthClass}>
            <Skeleton className="mx-400 my-[15px] h-5 w-12" />
          </div>
          <div className={SESSION_TABLE_COLUMNS.recurrence.widthClass}>
            <Skeleton className="mx-400 my-[15px] h-5 w-16" />
          </div>
          <div className={SESSION_TABLE_COLUMNS.progress.widthClass}>
            <Skeleton className="mx-400 my-[15px] h-5 w-14" />
          </div>
          <div className={SESSION_TABLE_COLUMNS.status.widthClass}>
            <Skeleton className="mx-400 my-[15px] h-5 w-10" />
          </div>
          <div className={SESSION_TABLE_COLUMNS.attendance.widthClass}>
            <Skeleton className="mx-400 my-[15px] h-5 w-16" />
          </div>
          <div className="flex-1" />
          <div className={SESSION_TABLE_COLUMNS.more.widthClass} />
        </div>

        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="border-line flex w-full items-center border-b last:border-b-0">
            <div className={`flex items-center ${SESSION_TABLE_COLUMNS.titleSticky.widthClass}`}>
              <div className={SESSION_TABLE_COLUMNS.toggle.widthClass} />
              <Skeleton className="my-400 h-5 w-32" />
            </div>
            <div className={SESSION_TABLE_COLUMNS.date.widthClass}>
              <Skeleton className="mx-400 h-5 w-24" />
            </div>
            <div className={SESSION_TABLE_COLUMNS.recurrence.widthClass}>
              <Skeleton className="mx-400 h-5 w-20" />
            </div>
            <div className={SESSION_TABLE_COLUMNS.progress.widthClass}>
              <Skeleton className="mx-400 h-5 w-10" />
            </div>
            <div className={SESSION_TABLE_COLUMNS.status.widthClass}>
              <Skeleton className="mx-400 h-6 w-16 rounded-full" />
            </div>
            <div className={SESSION_TABLE_COLUMNS.attendance.widthClass}>
              <Skeleton className="mx-400 h-8 w-20 rounded-sm" />
            </div>
            <div className="flex-1" />
            <div className={SESSION_TABLE_COLUMNS.more.widthClass} />
          </div>
        ))}
      </div>
    </div>
  );
}

export { SessionTableSkeleton };
