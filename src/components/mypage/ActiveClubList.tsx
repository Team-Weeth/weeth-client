import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tag } from '@/components/ui/tag';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { MyPageUsingProfile } from '@/types/mypage';
import SettingIcon from '@/assets/icons/setting.svg';

interface ActiveClubListProps extends React.HTMLAttributes<HTMLDivElement> {
  profiles?: MyPageUsingProfile[];
  clubId: string;
}

function ActiveClubList({ profiles = [], clubId, className, ...props }: ActiveClubListProps) {
  return (
    <div
      className={cn('bg-container-neutral w-full overflow-hidden rounded-lg p-450', className)}
      {...props}
    >
      <p className="tablet:typo-sub1 typo-sub3 text-text-alternative mb-[18px]">
        사용 중인 프로필 <span>{profiles.length}</span>
      </p>
      <div
        className="scrollbar-none tablet:grid tablet:overflow-x-visible flex w-full flex-col gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, 182px)' }}
      >
        {profiles.map((profile) => (
          <ActiveClubCard key={profile.profileId} profile={profile} />
        ))}
        <ProfileManageCard clubId={clubId} />
      </div>
    </div>
  );
}

interface ActiveClubCardProps {
  profile: MyPageUsingProfile;
}

function ActiveClubCard({ profile }: ActiveClubCardProps) {
  const clubLabel =
    profile.clubs.length > 1
      ? `${profile.clubs[0].name} 외 ${profile.clubs.length - 1}`
      : (profile.clubs[0]?.name ?? '');

  return (
    <>
      <div className="tablet:flex bg-container-neutral-alternative hidden flex-col gap-2 rounded-lg p-450">
        <Avatar size={100} type="round" className="self-center">
          <AvatarImage src={profile.profileImageUrl ?? undefined} alt={profile.name} />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col">
          <span className="typo-sub3 text-text-strong line-clamp-1">{profile.name}</span>
          <span
            className={cn(
              'typo-body1 line-clamp-1 min-h-[20px]',
              profile.bio ? 'text-text-alternative' : 'text-text-disabled',
            )}
          >
            {profile.bio ?? '-'}
          </span>
          <Tag variant="primary" className="mt-2 self-start">
            {clubLabel}
          </Tag>
        </div>
      </div>
      <div className="tablet:hidden bg-container-neutral-alternative tablet:w-[220px] flex shrink-0 gap-2 rounded-lg p-450">
        <Avatar size={64} type="round">
          <AvatarImage src={profile.profileImageUrl ?? undefined} alt={profile.name} />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col">
          <span className="typo-sub3 text-text-strong">{profile.name}</span>
          <span
            className={cn(
              'typo-body2 line-clamp-1 min-h-[18px]',
              profile.bio ? 'text-text-alternative' : 'text-text-disabled',
            )}
          >
            {profile.bio ?? '-'}
          </span>
          <Tag variant="primary" className="mt-2 self-start">
            {clubLabel}
          </Tag>
        </div>
      </div>
    </>
  );
}

function ProfileManageCard({ clubId }: { clubId: string }) {
  return (
    <>
      <Link
        href={`/${clubId}/mypage/profiles`}
        className="tablet:flex bg-container-neutral-alternative hover:bg-container-neutral-interaction hidden h-[220px] flex-col items-center justify-center gap-2 rounded-lg p-450"
      >
        <Icon src={SettingIcon} size={32} className="text-icon-normal" />
        <span className="typo-button1 text-text-strong">프로필 관리</span>
      </Link>
      <Link
        href={`/${clubId}/mypage/profiles`}
        className="bg-container-neutral-alternative hover:bg-container-neutral-interaction tablet:hidden tablet:h-[128px] tablet:w-[140px] flex shrink-0 items-center justify-center gap-3 rounded-md px-400 py-300"
      >
        <Icon src={SettingIcon} size={20} className="text-icon-normal" />
        <span className="typo-button1 text-text-strong">프로필 관리</span>
      </Link>
    </>
  );
}

export { ActiveClubList, type ActiveClubListProps };
