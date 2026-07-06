import { Skeleton } from '@/components/ui';

function DuesPageSkeleton() {
  return (
    <div className="tablet:p-700 flex min-w-85 flex-col gap-400 p-400">
      {/* TopBar */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <div className="flex flex-row gap-200">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-sm" />
        </div>
      </div>

      {/* GenerationFilter */}
      <div className="flex flex-row items-start gap-200">
        <Skeleton className="h-8 w-16 rounded-sm" />
        <Skeleton className="h-8 w-52 rounded-md" />
      </div>

      {/* BalanceCard + Chart */}
      <div className="tablet:flex-row flex flex-col gap-1">
        <DuesBalanceCardSkeleton />
        <DuesChartSkeleton />
      </div>

      {/* TransactionTable */}
      <DuesTransactionTableSkeleton />
    </div>
  );
}

function DuesBalanceCardSkeleton() {
  return (
    <div className="bg-container-neutral tablet:w-80 tablet:p-600 flex w-full flex-col gap-400 rounded-lg p-400">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-11 w-52" />
      <Skeleton className="h-10 w-24 rounded-md" />

      <div className="mt-14 flex flex-col gap-300">
        <Skeleton className="h-16 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}

function DuesChartSkeleton() {
  return (
    <div className="bg-container-neutral tablet:p-600 flex flex-1 flex-col gap-500 rounded-lg p-400">
      <div className="flex items-start justify-between gap-400">
        <div className="flex flex-col gap-100">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-24 w-44 shrink-0 rounded-md" />
      </div>

      <div className="flex h-[260px] items-end gap-400 px-200">
        {[70, 45, 90, 55, 80, 60].map((height, index) => (
          <Skeleton
            key={index}
            className="flex-1 rounded-t-lg rounded-b-none"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function DuesTransactionTableSkeleton() {
  return (
    <div className="bg-container-neutral flex flex-col gap-600 rounded-lg p-450">
      <Skeleton className="h-6 w-20" />

      <div className="flex flex-col gap-400">
        <div className="flex flex-wrap items-center justify-between gap-200">
          <div className="flex items-center gap-[5px]">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-[70px] rounded-[10px]" />
            ))}
          </div>
          <Skeleton className="h-9 w-20 rounded-[10px]" />
        </div>

        <div className="border-line flex flex-col overflow-hidden rounded-sm border">
          <Skeleton className="h-12 w-full rounded-none" />
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="border-line flex items-center gap-400 border-t px-400 py-300">
              <Skeleton className="h-6 w-12 shrink-0 rounded-sm" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-24 shrink-0" />
              <Skeleton className="tablet:block hidden h-5 w-24 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DuesPageSkeleton };
