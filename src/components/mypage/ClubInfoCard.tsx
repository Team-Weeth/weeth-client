'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/cn';
import { Avatar, AvatarFallback, AvatarImage, Divider, Icon, Tag } from '@/components/ui';
import { PeopleIcon } from '@/assets/icons';
import type { ClubDto } from '@/types/mypage';
import { cardClass } from './InfoCard';
import { MyPageDropdownMenu } from './LeaveClubDropdownMenu';

const SetCardinalModal = dynamic(() =>
  import('./SetCardinalModal').then((m) => ({ default: m.SetCardinalModal })),
);

interface ClubInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  club: ClubDto;
}

function ClubInfoCard({ club, className }: ClubInfoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className={cn('w-[314px]', cardClass, className)}>
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
              <MyPageDropdownMenu />
            </div>

            <div className="flex flex-col">
              <span className="typo-sub1 text-text-strong mb-[2px]">{club.name}</span>
              {club.description && (
                <p className="typo-body2 text-text-normal mb-[6px] line-clamp-1">
                  {club.description}
                </p>
              )}
              <div className="text-text-alternative mb-300 flex items-center gap-100">
                <Icon src={PeopleIcon} size={16} className="text-icon-altenative" />
                <span className="typo-caption1 text-text-alternative">{club.memberCount}명</span>
              </div>
              <div className="bg-container-neutral-alternative flex gap-2 rounded-md px-400 py-300">
                <Avatar
                  size={64}
                  type="round"
                  className="border-line size-[64px] rounded-full border"
                >
                  {club.profileImageUrl && (
                    <AvatarImage src={club.profileImageUrl} alt={club.name} />
                  )}
                  <AvatarFallback variant="club" />
                </Avatar>
                <div className="flex flex-col justify-center gap-1">
                  <span className="typo-sub3 text-text-strong">{club.name}</span>
                  {club.description && (
                    <p className="typo-body2 text-text-alternative line-clamp-1">
                      {club.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-450">
            <Divider />
            <div className="flex flex-col gap-2">
              <span className="typo-sub3 text-text-alternative">활동 기수</span>
              <div className="flex flex-wrap gap-100">
                {club.cardinals.length > 0 ? (
                  <div className="flex items-center gap-100">
                    {club.cardinals.map((gen) => (
                      <Tag key={gen} variant={'primary'}>
                        {gen}기
                      </Tag>
                    ))}
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
          </div>
        </div>
      </div>

      <SetCardinalModal open={modalOpen} onOpenChange={setModalOpen} club={club} />
    </>
  );
}

export { ClubInfoCard, type ClubInfoCardProps };
