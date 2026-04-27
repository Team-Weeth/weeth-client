import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

type EditProfileSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function EditProfileSkeleton({ className, ...props }: EditProfileSkeletonProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1088px] flex-col gap-[35px] px-450 pt-450 pb-[80px]',
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col gap-200">
        <div className="flex items-center gap-200">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="flex flex-col items-center gap-600 pt-450">
        <div className="flex flex-col items-center gap-300">
          <Skeleton className="size-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        <div className="flex w-full max-w-[640px] flex-col gap-600">
          <div className="bg-container-neutral flex flex-col gap-400 rounded-lg p-450">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
          <div className="bg-container-neutral flex flex-col gap-400 rounded-lg p-450">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export { EditProfileSkeleton, type EditProfileSkeletonProps };
