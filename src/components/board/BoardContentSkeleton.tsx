import { Skeleton } from '@/components/ui/skeleton';

function PostCardSkeleton() {
  return (
    <div className="bg-container-neutral flex flex-col items-start gap-400 self-stretch rounded-(--radius-lg) px-450 py-400">
      {/* Header: 아바타 + 이름/날짜 */}
      <div className="flex items-center gap-300 self-stretch">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex flex-col gap-100">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      {/* Content: 제목 + 본문 */}
      <div className="flex flex-col gap-200 self-stretch">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Actions: 좋아요 + 댓글 */}
      <div className="flex gap-300">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

function BoardContentSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-400">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { BoardContentSkeleton };
