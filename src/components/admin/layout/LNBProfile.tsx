'use client';

import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useUserName, useUserProfileImageUrl } from '@/stores';
import { NotificationModal } from '@/components/admin/layout/NotificationModal';

interface LNBProfileProps {
  collapsed: boolean;
}

function LNBProfile({ collapsed }: LNBProfileProps) {
  const userName = useUserName();
  const profileImageUrl = useUserProfileImageUrl();
  const [notifOpen, setNotifOpen] = useState(false);
  // TODO: 알림 기능 구현 시 hasNotification 연결

  const avatarEl = userName ? (
    <Avatar size={40} type="round" colorScheme="line" className="shrink-0">
      <AvatarImage
        key={profileImageUrl ?? 'fallback'}
        src={profileImageUrl ?? undefined}
        alt={userName}
        className="object-cover"
      />
      <AvatarFallback />
    </Avatar>
  ) : null;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setNotifOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setNotifOpen(true);
          }
        }}
        className={cn(
          'hover:bg-container-neutral-interaction flex cursor-pointer items-center rounded-lg transition-colors',
          collapsed
            ? 'size-[56px] justify-center self-center'
            : 'h-[65px] w-full gap-[38px] pr-200 pl-400',
        )}
      >
        {collapsed ? (
          <div className="relative">
            {avatarEl ?? <Skeleton className="size-10 rounded-full" />}
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-200">
            {avatarEl ? (
              <>
                {avatarEl}
                <span className="typo-sub1 text-text-normal truncate">{userName}</span>
              </>
            ) : (
              <>
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <Skeleton className="h-[19px] w-24 rounded-sm" />
              </>
            )}
          </div>
        )}
      </div>
      <NotificationModal
        open={notifOpen}
        onOpenChange={setNotifOpen}
        collapsed={collapsed}
        notifications={[]}
      />
    </>
  );
}

export { LNBProfile, type LNBProfileProps };
