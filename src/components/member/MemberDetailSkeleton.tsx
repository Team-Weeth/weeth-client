import { Skeleton } from '@/components/ui/skeleton';

function MemberDetailSkeleton() {
  return (
    <div>
      <div className="bg-container-neutral-interaction relative h-[190px] rounded-t-lg">
        <Skeleton className="absolute bottom-[-30px] left-[20px] size-[100px] rounded-full" />
      </div>

      <div className="bg-container-neutral flex flex-col px-5 pt-10 pb-5">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-2 h-4 w-40" />

        <div className="mt-[10px] flex items-center gap-2">
          <Skeleton className="h-5 w-14 rounded-[5px]" />
          <Skeleton className="h-5 w-10 rounded-[5px]" />
        </div>

        <Skeleton className="mt-3 h-4 w-36" />
        <Skeleton className="mt-3 h-3 w-28" />
        <Skeleton className="mt-5 h-[68px] w-full rounded-md" />
      </div>
    </div>
  );
}

export { MemberDetailSkeleton };
