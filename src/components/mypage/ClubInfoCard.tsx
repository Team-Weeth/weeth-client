'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/cn';
import { Avatar, AvatarFallback, AvatarImage, Button, Divider, Icon, Tag } from '@/components/ui';
import { ArrowRightIcon, PeopleIcon } from '@/assets/icons';
import type { MyPageActivityClub } from '@/types/mypage';
import { cardClass } from './InfoCard';
import { LeaveClubDropdownMenu } from './LeaveClubDropdownMenu';
import { useRouter } from 'next/navigation';

const SetCardinalModal = dynamic(() =>
  import('./SetCardinalModal').then((m) => ({ default: m.SetCardinalModal })),
);

interface ClubInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  club: MyPageActivityClub;
}

function ClubInfoCard({ club, className }: ClubInfoCardProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const assignedProfile = club.currentProfile;

  return (
    <>
      <div className={cn('tablet:w-[314px] w-[250px]', cardClass, className)}>
        <div className="flex flex-col gap-300">
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Avatar
                  size={64}
                  type="square"
                  className="border-line size-[64px] rounded-lg border"
                >
                  {club.profileImageUrl && (
                    <AvatarImage src={club.profileImageUrl} alt={club.name} />
                  )}
                  <AvatarFallback variant="club" />
                </Avatar>
              </div>
              <LeaveClubDropdownMenu clubId={club.id} />
            </div>

            <div className="flex flex-col">
              <span className="tablet:typo-sub1 typo-sub3 text-text-strong mb-[2px]">
                {club.name}
              </span>
              <p
                className={cn(
                  'tablet:typo-body2 typo-caption2 mb-[6px] line-clamp-1 min-h-[18px]',
                  club.description ? 'text-text-normal' : 'invisible',
                )}
              >
                {club.description ?? ' '}
              </p>
              <div className="text-text-alternative mb-300 flex items-center gap-100">
                <Icon src={PeopleIcon} size={16} className="text-icon-alternative" />
                <span className="typo-caption1 text-text-alternative">{club.memberCount}명</span>
              </div>
              <div className="bg-container-neutral-alternative flex gap-2 rounded-md px-400 py-300">
                <Avatar
                  size={40}
                  type="round"
                  className="border-line tablet:size-[64px] size-10 rounded-full border"
                >
                  {assignedProfile?.profileImageUrl && (
                    <AvatarImage src={assignedProfile.profileImageUrl} alt={assignedProfile.name} />
                  )}
                  <AvatarFallback />
                </Avatar>
                <div className="flex flex-col justify-center gap-1">
                  <span className="tablet:typo-sub3 typo-button2 text-text-strong">
                    {assignedProfile?.name ?? '연결된 프로필 없음'}
                  </span>
                  <p
                    className={cn(
                      'tablet:typo-body2 typo-caption2 line-clamp-1 min-h-[18px]',
                      assignedProfile?.bio ? 'text-text-alternative' : 'invisible',
                    )}
                  >
                    {assignedProfile?.bio ?? ' '}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-450">
            <Divider />
            <div className="flex flex-col gap-2">
              <span className="tablet:typo-sub3 typo-button2 text-text-alternative">활동 기수</span>
              <div className="min-w-0">
                {club.cardinals.length > 0 ? (
                  <div className="scrollbar-none overflow-x-auto">
                    <div className="flex w-max items-center gap-100 pr-1">
                      {club.cardinals.map((gen) => (
                        <Tag key={gen} variant={'primary'}>
                          {gen}기
                        </Tag>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full items-center justify-between">
                    <Tag className="text-text-alternative inline-flex items-center gap-100 bg-[#9095991A]">
                      미설정
                    </Tag>
                    <button
                      type="button"
                      className="typo-caption1 text-text-alternative underline"
                      onClick={() => setModalOpen(true)}
                    >
                      기수 설정하기
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              size="lg"
              className="flex gap-100"
              onClick={() => router.push(`/${club.id}/home`)}
            >
              동아리 입장하기
              <Icon src={ArrowRightIcon} className="text-icon-normal p-1" size={20} />
            </Button>
          </div>
        </div>
      </div>

      <SetCardinalModal open={modalOpen} onOpenChange={setModalOpen} club={club} />
    </>
  );
}

export { ClubInfoCard, type ClubInfoCardProps };
