import { Skeleton } from '@/components/ui/skeleton';

function MyPageFeedbackSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <Skeleton className="tablet:my-0 my-300 h-8 w-40" />
      <Skeleton className="tablet:h-[214px] h-[108px] w-full rounded-lg" />
      <div className="flex flex-col gap-200">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-16 w-full max-w-96" />
      </div>
      <Skeleton className="h-[175px] w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}

export { MyPageFeedbackSkeleton };
