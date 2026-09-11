import { Skeleton } from '@/components/ui/skeleton';

function MemberCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="bg-container-neutral flex h-[242px] w-full flex-col items-center rounded-t-lg px-[35px] pt-[22px] pb-6">
        <Skeleton className="size-[100px] rounded-full" />
        <Skeleton className="mt-[10px] h-5 w-20" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-5 w-14 rounded-[5px]" />
          <Skeleton className="h-5 w-10 rounded-[5px]" />
        </div>
        <Skeleton className="mt-3 h-4 w-full" />
      </div>
      <div className="bg-container-neutral-alternative flex items-center justify-between rounded-b-lg px-[18px] py-[13px]">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="size-[22px] rounded-[4px]" />
      </div>
    </div>
  );
}

function MemberPageContentSkeleton() {
  return (
    <div className="tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-1 gap-300">
      {Array.from({ length: 8 }).map((_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { MemberCardSkeleton, MemberPageContentSkeleton };
