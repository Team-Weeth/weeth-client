import { Skeleton } from '@/components/ui';

function DuesPageSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-[1250px] flex-col gap-700 px-450 pt-600 pb-800">
      <div className="flex items-end justify-between gap-400">
        <div className="flex flex-col gap-300">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-16 w-[86px] rounded-md" />
      </div>

      <div className="desktop:flex-row flex flex-col gap-500">
        <DuesLeftSectionSkeleton />
        <DuesTransactionSectionSkeleton />
      </div>
    </main>
  );
}

function DuesLeftSectionSkeleton() {
  return (
    <section className="desktop:w-[360px] desktop:shrink-0 flex w-full flex-col gap-450">
      <Skeleton className="h-[44px] w-full rounded-md" />

      <div className="bg-container-neutral flex flex-col gap-300 rounded-lg p-450">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-[64px] w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>

      <div className="bg-container-neutral rounded-lg p-450">
        <div className="flex flex-col gap-200">
          <Skeleton className="h-5 w-24" />
          <div className="flex items-end gap-200">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    </section>
  );
}

function DuesTransactionSectionSkeleton() {
  return (
    <section className="bg-container-neutral flex min-h-[420px] flex-1 flex-col rounded-lg p-500">
      <Skeleton className="h-7 w-24" />

      <div className="mt-500 flex flex-wrap gap-[5px]">
        <Skeleton className="h-10 w-[70px] rounded-[10px]" />
        <Skeleton className="h-10 w-[70px] rounded-[10px]" />
        <Skeleton className="h-10 w-[70px] rounded-[10px]" />
        <Skeleton className="h-10 w-[70px] rounded-[10px]" />
      </div>

      <div className="mt-500 flex flex-col gap-400">
        {Array.from({ length: 5 }, (_, index) => (
          <DuesTransactionItemSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

function DuesTransactionItemSkeleton() {
  return (
    <div className="flex w-full items-center gap-400 rounded-md p-200">
      <Skeleton className="size-12 shrink-0 rounded-md" />

      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>

      <Skeleton className="h-5 w-24 shrink-0" />
    </div>
  );
}

export { DuesPageSkeleton };
