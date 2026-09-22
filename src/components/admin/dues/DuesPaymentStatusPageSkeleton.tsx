import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function DuesPaymentStatusPageSkeleton() {
  return (
    <div className="flex min-w-85 flex-col">
      <div className="tablet:p-700 flex flex-col gap-700 p-400">
        {/* 헤더 */}
        <div className="flex flex-col gap-400">
          <Skeleton className="h-6 w-16 rounded-sm" />
          <Skeleton className="h-9 w-64" />
        </div>

        {/* 상단 섹션 */}
        <div className="flex flex-wrap items-stretch gap-600">
          <DuesPaymentSummaryCardSkeleton />
          <div className="tablet:w-84.75 flex w-full flex-col gap-400">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>

        {/* 부원별 납부현황 테이블 */}
        <DuesMemberPaymentTableSkeleton />
      </div>
    </div>
  );
}

function DuesPaymentSummaryCardSkeleton() {
  return (
    <Card className="flex min-w-[300px] flex-1 flex-col overflow-hidden p-400">
      <Skeleton className="h-8 w-24" />

      <div className="mt-400 flex items-end gap-200">
        <Skeleton className="h-11 w-52" />
      </div>

      <div className="mt-auto pt-500">
        <Skeleton className="mb-200 h-4 w-40" />
        <Skeleton className="h-[15px] w-full rounded-[4px]" />
      </div>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="flex flex-1 flex-row items-center justify-between px-400 py-300">
      <div className="flex flex-col gap-100">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </Card>
  );
}

function DuesMemberPaymentTableSkeleton() {
  return (
    <div className="bg-container-neutral flex flex-col gap-600 rounded-lg p-450">
      <Skeleton className="h-8 w-40" />

      <div className="flex flex-col gap-400">
        {/* 필터 칩 + 정렬 */}
        <div className="flex flex-wrap items-center justify-between gap-200">
          <div className="flex items-center gap-[5px]">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-[70px] rounded-[10px]" />
            ))}
          </div>
          <Skeleton className="h-9 w-20 rounded-[10px]" />
        </div>

        {/* 검색바 */}
        <Skeleton className="h-11 w-full rounded-md" />

        {/* 테이블 */}
        <div className="border-line flex flex-col overflow-hidden rounded-sm border">
          <Skeleton className="h-12 w-full rounded-none" />
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="border-line flex items-center gap-400 border-t px-400 py-300"
            >
              <Skeleton className="h-4 w-4 shrink-0 rounded-[3px]" />
              <div className="flex flex-1 items-center gap-300">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-5 w-24 shrink-0" />
              <Skeleton className="h-5 w-24 shrink-0" />
              <Skeleton className="h-6 w-12 shrink-0 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DuesPaymentStatusPageSkeleton };
