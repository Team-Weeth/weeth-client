'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
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
        'border-line bg-container-neutral flex h-30 items-start border-b py-400',
        collapsed ? 'justify-center' : 'flex-col gap-300 px-400',
      )}
    >
      <Avatar size={40} type="square" color="secondary">
        {club?.profileImageUrl && <AvatarImage src={club.profileImageUrl} alt={club.name} />}
        <AvatarFallback>{club?.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="flex flex-col gap-100">
          <span className="typo-caption2 text-text-alternative">{club?.schoolName}</span>
          <span className="typo-sub1 text-text-strong">{club?.name}</span>
        </div>
      )}
    </div>
  );
}

export { LNBClubInfo, type LNBClubInfoProps };
