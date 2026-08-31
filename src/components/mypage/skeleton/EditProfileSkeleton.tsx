import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

type EditProfileSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function EditProfileSkeleton({ className, ...props }: EditProfileSkeletonProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1088px] flex-col gap-4 px-450 pt-450 pb-[80px]',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-1">
        <Skeleton className="size-8 rounded-sm" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-[30px] w-32 rounded-sm" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-600 pt-450">
        <div className="flex w-full max-w-[640px] flex-col gap-600">
          <div className="flex flex-col gap-500">
            <div className="flex flex-col gap-400">
              <div className="flex flex-col gap-200">
                <Skeleton className="h-4 w-14 rounded-sm" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              <div className="flex flex-col gap-200">
                <Skeleton className="h-4 w-16 rounded-sm" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              <div className="flex flex-col gap-200">
                <Skeleton className="h-4 w-10 rounded-sm" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>

            <div className="flex flex-col gap-400">
              <div className="flex flex-col gap-200">
                <Skeleton className="h-4 w-10 rounded-sm" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>

              <div className="flex flex-col gap-200">
                <Skeleton className="h-4 w-10 rounded-sm" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export { EditProfileSkeleton, type EditProfileSkeletonProps };
