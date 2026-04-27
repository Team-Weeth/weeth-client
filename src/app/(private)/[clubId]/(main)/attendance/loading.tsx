import { Skeleton } from '@/components/ui';

export default function AttendanceLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 pt-600">
      <div className="px-450">
        <Skeleton className="h-4 w-8" />
      </div>

      <div className="flex flex-col gap-200 px-450">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="flex flex-col gap-300 px-450">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-[72px] w-full rounded-lg" />
      </div>
    </div>
  );
}
