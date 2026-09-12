import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import MailIcon from '@/assets/icons/mail.svg';
import PhoneIcon from '@/assets/icons/phone.svg';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import type { MemberProfile } from '@/types/member';
import { formatPhone } from '@/utils/shared/formatPhone';
import { MemberHiddenCardinalsBadge } from './MemberHiddenCardinalsBadge';
import { MemberRoleFlag } from './MemberRoleFlag';

interface MemberDetailBodyProps {
  member: MemberProfile;
}

function MemberDetailBody({ member }: MemberDetailBodyProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const sortedCardinals = [...member.cardinals].sort((a, b) => b - a);
  const [latestCardinal, ...hiddenCardinals] = sortedCardinals;
  const postCount = member.postCount ?? 0;

  return (
    <div>
      <div className="bg-brand-primary relative h-[190px] rounded-t-lg">
        {member.coverImageUrl && (
          <Image
            src={member.coverImageUrl}
            alt="coverImageUrl"
            fill
            className="rounded-t-lg object-cover"
          />
        )}
        <MemberRoleFlag role={member.role} />
        <Avatar size={100} className="absolute bottom-[-30px] left-[20px]">
          {member.profileImageUrl && (
            <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} />
          )}
          <AvatarFallback />
        </Avatar>
      </div>

      <div className="bg-container-neutral flex flex-col px-5 pt-10 pb-5">
        <p className="typo-h3 text-text-strong">{member.name}</p>
        <p className="typo-body2 text-text-alternative mt-1">{member.description}</p>

        <div className="mt-[10px] flex flex-wrap items-center gap-2">
          {member.position && (
            <Tag variant="secondary" className="rounded-[5px]">
              {member.position}
            </Tag>
          )}
          {latestCardinal !== undefined && (
            <Tag variant="end" className="rounded-[5px]">
              {latestCardinal}기
            </Tag>
          )}
          {hiddenCardinals.length > 0 && <MemberHiddenCardinalsBadge cardinals={hiddenCardinals} />}
        </div>

        <div className="typo-body2 text-text-strong tablet:flex-row mt-3 flex flex-col gap-[9px]">
          <div className="flex shrink-0 items-center gap-1">
            <Icon src={PhoneIcon} size={18} alt="연락처" className="text-icon-alternative" />
            <span className="whitespace-nowrap">
              {member.phone ? formatPhone(member.phone) : '비공개'}
            </span>
          </div>
          <div className="flex w-full min-w-0 items-center gap-1">
            <Icon src={MailIcon} size={18} alt="이메일" className="text-icon-alternative" />
            <span className="truncate">{member.email ? member.email : '비공개'}</span>
          </div>
        </div>

        {(member.department || member.studentId) && (
          <p className="typo-caption2 text-text-alternative mt-3 flex items-center gap-[6px]">
            {member.department && <span>{member.department}</span>}
            {member.department && member.studentId && <span>·</span>}
            {member.studentId && <span>{member.studentId}</span>}
          </p>
        )}

        <Link
          href={`/${clubId}/member/${member.id}/posts`}
          className="bg-container-neutral-alternative mt-5 flex flex-col gap-200 rounded-md px-400 py-400"
        >
          <div className="flex items-center justify-between">
            <span className="typo-button2 text-text-alternative">작성한 글 보기</span>
            <span className="bg-icon-alternative flex size-[28px] items-center justify-center rounded-full">
              <Icon src={ArrowRightIcon} size={10} className="text-icon-inverse" />
            </span>
          </div>
          <span className="typo-sub1 text-text-strong">{postCount}개</span>
        </Link>
      </div>
    </div>
  );
}

export { MemberDetailBody, type MemberDetailBodyProps };
