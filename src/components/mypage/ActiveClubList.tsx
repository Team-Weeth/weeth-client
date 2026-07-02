import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback, Tag, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ClubDto } from '@/types/mypage';
import { SettingIcon } from '@/assets/icons';

interface ActiveClubListProps extends React.HTMLAttributes<HTMLDivElement> {
  clubs?: ClubDto[];
  clubId: string;
}

function ActiveClubList({ clubs = [], clubId, className, ...props }: ActiveClubListProps) {
  return (
    <div
      className={cn('bg-container-neutral w-full overflow-hidden rounded-lg p-450', className)}
      {...props}
    >
      <p className="tablet:typo-sub1 typo-sub3 text-text-alternative mb-[18px]">
        사용 중인 프로필 <span>{clubs.length}</span>
      </p>
      <div
        className="scrollbar-none tablet:grid tablet:overflow-x-visible flex w-full flex-col gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, 182px)' }}
      >
        {clubs.map((club) => (
          <ActiveClubCard key={club.id} club={club} />
        ))}
        <ProfileManageCard clubId={clubId} />
      </div>
    </div>
  );
}

interface ActiveClubCardProps {
  club: ClubDto;
}

function ActiveClubCard({ club }: ActiveClubCardProps) {
  return (
    <>
      <div className="tablet:flex bg-container-neutral-alternative hidden flex-col gap-2 rounded-lg p-450">
        <Avatar size={100} type="round" className="self-center">
          <AvatarImage src={club.profileImageUrl ?? undefined} alt={club.name} />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col">
          <span className="typo-sub3 text-text-strong">{club.name}</span>
          {club.description && (
            <span className="typo-body1 text-text-alternative line-clamp-1">
              {club.description}
            </span>
          )}
          <Tag variant="primary" className="mt-2 self-start">
            {club.name}
          </Tag>
        </div>
      </div>
      <div className="tablet:hidden bg-container-neutral-alternative tablet:w-[220px] flex shrink-0 gap-2 rounded-lg p-450">
        <Avatar size={64} type="round">
          <AvatarImage src={club.profileImageUrl ?? undefined} alt={club.name} />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col">
          <span className="typo-sub3 text-text-strong">{club.name}</span>
          {club.description && (
            <span className="typo-body2 text-text-alternative line-clamp-1">
              {club.description}
            </span>
          )}
          <Tag variant="primary" className="mt-2 self-start">
            {club.name}
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
        className="tablet:flex bg-container-neutral-alternative hidden h-[220px] flex-col items-center justify-center gap-2 rounded-lg p-450"
      >
        <Icon src={SettingIcon} size={32} className="text-icon-normal" />
        <span className="typo-button1 text-text-strong">프로필 관리</span>
      </Link>
      <Link
        href={`/${clubId}/mypage/profiles`}
        className="bg-container-neutral-alternative tablet:hidden tablet:h-[128px] tablet:w-[140px] flex shrink-0 items-center justify-center gap-3 rounded-md px-400 py-300"
      >
        <Icon src={SettingIcon} size={20} className="text-icon-normal" />
        <span className="typo-button1 text-text-strong">프로필 관리</span>
      </Link>
    </>
  );
}

export { ActiveClubList, type ActiveClubListProps };
