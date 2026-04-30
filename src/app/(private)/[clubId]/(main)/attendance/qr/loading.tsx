import { Skeleton } from '@/components/ui';

export default function AttendanceQRLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 pt-600">
      <div className="px-450">
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-col gap-700 px-450">
        <div className="flex w-full flex-col items-center gap-200">
          <Skeleton className="h-7 w-80" />
          <Skeleton className="h-5 w-72" />
        </div>

        <div className="bg-container-neutral flex w-full flex-col items-center gap-400 rounded-lg p-400">
          <div className="flex w-full flex-col items-center gap-600 p-400">
            <Skeleton className="size-[256px] rounded-md" />
            <div className="flex flex-col items-center gap-200">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-52" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
