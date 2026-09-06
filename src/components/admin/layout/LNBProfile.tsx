'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { useUserName, useUserProfileImageUrl } from '@/stores';
// TODO: 알림 기능 구현 시 NotificationModal 주석 해제
// import { NotificationModal } from '@/components/admin/layout/NotificationModal';

interface LNBProfileProps {
  collapsed: boolean;
}

function LNBProfile({ collapsed }: LNBProfileProps) {
  const userName = useUserName();
  const profileImageUrl = useUserProfileImageUrl();
  // TODO: 알림 기능 구현 시 notifOpen 상태 및 핸들러 주석 해제
  // const [notifOpen, setNotifOpen] = useState(false);
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
    <div
      className={cn(
        'flex items-center rounded-lg',
        collapsed
          ? 'size-[56px] justify-center self-center'
          : 'h-[65px] w-full gap-[38px] pr-200 pl-400',
      )}
    >
      {/* TODO: 알림 기능 구현 시 클릭/호버 인터랙션 주석 해제
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
          'hover:bg-container-neutral-interaction ... cursor-pointer transition-colors',
          ...
        )}
      */}
      {collapsed ? (
        <div className="relative">{avatarEl ?? <Skeleton className="size-10 rounded-full" />}</div>
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
    // TODO: 알림 기능 구현 시 NotificationModal 주석 해제
    // <NotificationModal
    //   open={notifOpen}
    //   onOpenChange={setNotifOpen}
    //   collapsed={collapsed}
    //   notifications={[]}
    // />
  );
}

export { LNBProfile, type LNBProfileProps };
