'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useUserName, useUserProfileImageUrl } from '@/stores';

interface LNBProfileProps {
  collapsed: boolean;
}

function LNBProfile({ collapsed }: LNBProfileProps) {
  const userName = useUserName();
  const profileImageUrl = useUserProfileImageUrl();

  return (
    <div
      className={cn(
        'hover:bg-container-neutral-interaction flex cursor-pointer items-center rounded-lg transition-colors',
        collapsed ? 'h-[65px] w-full justify-center' : 'h-[65px] w-[208px] gap-[38px] pr-200 pl-400',
      )}
    >
      {collapsed ? (
        <div className="relative">
          <Avatar size={40} type="round" colorScheme="line" className="shrink-0">
            <AvatarImage
              key={profileImageUrl ?? 'fallback'}
              src={profileImageUrl ?? undefined}
              alt={userName ?? ''}
              className="object-cover"
            />
            <AvatarFallback />
          </Avatar>
          <div className="bg-state-error border-container-neutral absolute right-200 bottom-[10px] size-2.5 rounded-full border" />
        </div>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-200">
            <Avatar size={40} type="round" colorScheme="line" className="shrink-0">
              <AvatarImage
                key={profileImageUrl ?? 'fallback'}
                src={profileImageUrl ?? undefined}
                alt={userName ?? ''}
                className="object-cover"
              />
              <AvatarFallback />
            </Avatar>
            <span className="typo-sub1 text-text-normal truncate">{userName}</span>
          </div>
          <div className="bg-state-error border-container-neutral size-2.5 shrink-0 rounded-full border" />
        </>
      )}
    </div>
  );
}

export { LNBProfile, type LNBProfileProps };
