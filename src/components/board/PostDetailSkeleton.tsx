import { Divider } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { PostDetailHeader } from '@/components/board/PostDetailHeader';

function CommentSkeleton() {
  return (
    <div className="flex gap-300 px-450 py-300">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-200">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="bg-container-neutral flex flex-1 flex-col items-center overflow-hidden rounded-(--radius-lg)">
      <PostDetailHeader />

      <div className="flex flex-col items-start gap-600 self-stretch p-450">
        {/* Author */}
        <div className="flex items-center gap-300 self-stretch">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex flex-col gap-100">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        {/* Title + Body */}
        <div className="flex flex-col gap-200 self-stretch">
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Actions */}
        <div className="flex gap-300">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      <div className="self-stretch px-450 py-400">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <div className="self-stretch px-450">
        <Divider />
      </div>

      <div className="flex flex-col gap-200 self-stretch pb-400">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    </div>
  );
}

export { PostDetailSkeleton };
