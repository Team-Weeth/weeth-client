import { AttendanceHistorySkeleton } from '@/components/attendance/AttendanceHistorySkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttendanceHistoryLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 px-450 pt-600">
      <div className="flex flex-col items-start gap-200">
        <Skeleton className="h-4 w-24" />
        <div className="flex w-full items-center justify-between gap-400">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      <AttendanceHistorySkeleton />
    </div>
  );
}
