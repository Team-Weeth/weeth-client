'use client';

import { ClubAvatar } from '@/components/ui';
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
        'flex shrink-0 grow items-center rounded-lg py-300',
        collapsed ? 'justify-center' : 'gap-[10px] px-400',
      )}
    >
      <div className="rounded-[16.25px] border-[1.25px] border-line shrink-0">
        <ClubAvatar
          src={club?.profileImageUrl ?? null}
          name={club?.name ?? ''}
          size={50}
          className="rounded-[15px] border-0"
        />
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col gap-100">
          <span className="typo-caption2 text-text-alternative truncate">{club?.schoolName}</span>
          <span className="typo-sub1 text-text-normal truncate">{club?.name}</span>
        </div>
      )}
    </div>
  );
}

export { LNBClubInfo, type LNBClubInfoProps };
