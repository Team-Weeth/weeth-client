'use client';

import { ClubAvatar, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAdminClubQuery } from '@/hooks/queries/admin/useAdminClubQuery';

interface LNBClubInfoProps {
  collapsed: boolean;
}

function LNBClubInfo({ collapsed }: LNBClubInfoProps) {
  const { data: club } = useAdminClubQuery();

  return (
    <div
      className={cn(
        'flex shrink-0 grow cursor-pointer items-center py-300',
        collapsed
          ? 'group justify-center'
          : 'hover:bg-line gap-[10px] rounded-md px-400 transition-colors',
      )}
    >
      <div
        className={cn(
          'border-line shrink-0 rounded-[16.25px] border-[1.25px]',
          collapsed && 'relative',
        )}
      >
        {club ? (
          <ClubAvatar
            src={club.profileImageUrl ?? null}
            name={club.name}
            size={50}
            className="rounded-[15px] border-0"
          />
        ) : (
          <Skeleton className="size-[50px] rounded-[15px]" />
        )}
        {collapsed && (
          <div className="absolute inset-0 rounded-[15px] bg-transparent transition-colors group-hover:bg-black/10" />
        )}
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col gap-100">
          {club ? (
            <>
              <span className="typo-caption2 text-text-alternative truncate">
                {club.schoolName}
              </span>
              <span className="typo-sub1 text-text-normal truncate">{club.name}</span>
            </>
          ) : (
            <>
              <Skeleton className="h-3 w-16 rounded-sm" />
              <Skeleton className="h-[19px] w-28 rounded-sm" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { LNBClubInfo, type LNBClubInfoProps };
