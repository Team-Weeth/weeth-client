import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import type { MemberProfile } from '@/types/member';
import { MemberHiddenCardinalsBadge } from './MemberHiddenCardinalsBadge';
import { MemberRoleFlag } from './MemberRoleFlag';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import { useParams, useRouter } from 'next/navigation';

interface MemberProfileCardProps extends React.HTMLAttributes<HTMLElement> {
  member: MemberProfile;
  onSelectMember: (memberId: number) => void;
}

function MemberProfileCard({
  className,
  member,
  onSelectMember,
  ...props
}: MemberProfileCardProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  const sortedCardinals = [...member.cardinals].sort((a, b) => b - a);
  const [latestCardinal, ...hiddenCardinals] = sortedCardinals;
  const handleViewPostsClick = () => {
    router.push(`/${clubId}/member/${member.id}/posts`);
  };

  const handleCardClick = () => {
    if (isMobile) {
      router.push(`/${clubId}/member/${member.id}`);
      return;
    }
    onSelectMember(member.id);
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleCardClick}
        className={cn(
          'bg-container-neutral relative flex h-[242px] w-full flex-col items-center rounded-t-lg px-[35px] pt-[22px] pb-6',
          className,
        )}
        {...props}
      >
        <MemberRoleFlag role={member.role} />

        <Avatar size={100}>
          {member.profileImageUrl && (
            <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} />
          )}
          <AvatarFallback />
        </Avatar>

        <p className="typo-sub1 text-text-normal mt-[10px] w-full truncate text-center">
          {member.name}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {member.position && (
            <Tag variant="pink" className="rounded-[5px]">
              {member.position}
            </Tag>
          )}
          {latestCardinal !== undefined && (
            <Tag variant="end" className="rounded-[5px]">
              {latestCardinal}기
            </Tag>
          )}
          {hiddenCardinals.length > 0 && (
            <MemberHiddenCardinalsBadge
              cardinals={hiddenCardinals}
              onTriggerClick={(event) => event.stopPropagation()}
            />
          )}
        </div>
        <p className="typo-caption2 text-text-alternative mt-3 w-full truncate">
          {member.description}
        </p>
      </button>
      <button
        onClick={handleViewPostsClick}
        className="bg-container-neutral-alternative flex items-center justify-between rounded-b-lg px-[18px] py-[13px]"
      >
        <p className="typo-caption2 text-text-normal">작성한 글 보기</p>
        <span className="flex size-[22px] items-center justify-center rounded-[4px] bg-white">
          <Icon src={ArrowRightIcon} size={9} className="text-icon-normal" />
        </span>
      </button>
    </div>
  );
}

export { MemberProfileCard, type MemberProfileCardProps };
