'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/cn';
import { Avatar, AvatarFallback, AvatarImage, Button, Divider, Icon, Tag } from '@/components/ui';
import { ExitIcon, PeopleIcon } from '@/assets/icons';
import type { ClubDto } from '@/types/mypage';
import { cardClass } from './InfoCard';

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
      <div className={cn('w-[340px]', cardClass, className)}>
        <div className="flex flex-col gap-300">
          <div className="flex flex-col gap-4 px-200">
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
              <Link
                href={`/${club.id}/home`}
                className="text-icon-alternative hover:text-icon-normal transition-colors"
              >
                <Icon src={ExitIcon} size={24} alt="클럽 홈으로 이동" />
              </Link>
            </div>

            <div className="flex flex-col gap-100 pt-[6px]">
              <span className="typo-sub1 text-text-strong">{club.name}</span>
              {club.description && (
                <p className="typo-body2 text-text-alternative line-clamp-1">{club.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-450">
            <div className="text-text-alternative flex items-center gap-200 px-[10px]">
              <Icon src={PeopleIcon} size={16} className="text-icon-normal" />
              <span className="typo-button2 text-text-normal">{club.memberCount}명</span>
            </div>
            <Divider />
            <div className="flex flex-col gap-2 px-[10px]">
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
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setModalOpen(true)}
                  >
                    기수 설정하기
                  </Button>
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
