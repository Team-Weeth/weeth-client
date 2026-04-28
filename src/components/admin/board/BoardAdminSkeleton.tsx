import { Skeleton } from '@/components/ui';
import { BoardCardSkeleton } from './BoardCardSkeleton';

export function BoardAdminSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-400 p-700">
      {/* Toolbar skeleton */}
      <div className="flex flex-wrap items-center gap-300">
        <Skeleton className="h-20 min-w-65 flex-1 rounded-lg" />
        <Skeleton className="h-12 w-30 shrink-0 rounded-lg" />
      </div>

      {/* Board card skeletons */}
      <div className="flex flex-col gap-400">
        <div className="flex flex-col gap-400">
          <BoardCardSkeleton />
          <div className="border-line w-full border-t" />
          <BoardCardSkeleton />
        </div>

        <div className="border-line w-full border-t" />

        <div className="flex flex-col gap-200">
          <BoardCardSkeleton />
          <BoardCardSkeleton />
          <BoardCardSkeleton />
        </div>

        <Skeleton className="h-12 rounded-md" />
      </div>
    </div>
  );
}
