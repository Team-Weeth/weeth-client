import { Skeleton } from '@/components/ui/skeleton';

function SettingsRowSkeleton({ trailing = 'arrow' }: { trailing?: 'arrow' | 'button' }) {
  return (
    <div className="flex items-center justify-between gap-300 px-400 py-400">
      <Skeleton className="h-7 w-40" />
      {trailing === 'button' ? (
        <Skeleton className="h-12 w-28 rounded-md" />
      ) : (
        <Skeleton className="size-5 rounded-sm" />
      )}
    </div>
  );
}

function MyPageSettingsSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <Skeleton className="h-9 w-32" />

      <div className="flex flex-col gap-200">
        <Skeleton className="h-7 w-20" />
        <div className="bg-container-neutral rounded-lg">
          <div className="px-400 py-400">
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-200">
        <Skeleton className="h-7 w-20" />
        <div className="bg-container-neutral flex flex-col rounded-lg px-1 py-2">
          <div className="flex flex-col gap-2">
            <SettingsRowSkeleton />
            <SettingsRowSkeleton />
          </div>

          <div className="my-2 px-400">
            <Skeleton className="h-px w-full rounded-none" />
          </div>

          <div className="flex flex-col gap-2">
            <SettingsRowSkeleton />
            <SettingsRowSkeleton />
          </div>

          <div className="my-2 px-400">
            <Skeleton className="h-px w-full rounded-none" />
          </div>

          <SettingsRowSkeleton trailing="button" />
        </div>
      </div>
    </div>
  );
}

export { MyPageSettingsSkeleton };
