import { Skeleton } from '@/components/ui/skeleton';
import { ClubInfoCardSkeleton } from './MyPageContentSkeletons';

function MyPageActivitySkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <ClubInfoCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export { MyPageActivitySkeleton };
