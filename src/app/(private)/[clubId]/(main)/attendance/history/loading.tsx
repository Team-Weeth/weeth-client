import { Skeleton } from '@/components/ui/skeleton';

export default function AttendanceHistoryLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 px-450 pt-600">
      <div className="flex flex-col items-start gap-200">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="bg-container-neutral flex flex-col gap-400 rounded-lg p-400">
        <div className="flex gap-200">
          <Skeleton className="h-[60px] flex-1 rounded-md" />
          <Skeleton className="h-[60px] flex-1 rounded-md" />
          <Skeleton className="h-[60px] flex-1 rounded-md" />
        </div>

        <Skeleton className="h-px w-full" />

        <div className="flex flex-col gap-400">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-200">
              <div className="flex items-center gap-200">
                <Skeleton className="h-5 w-[49px] rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="flex flex-col gap-100">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
