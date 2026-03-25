'use client';

import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Button, Icon, Tag } from '@/components/ui';
import { ExitIcon, PeopleIcon } from '@/assets/icons';
import type { ClubDto } from '@/types/mypage';
import { cardClass } from './InfoCard';

interface ClubInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  club: ClubDto;
}

function ClubInfoCard({ club, className }: ClubInfoCardProps) {
  return (
    <div className={cn('w-[340px]', cardClass, className)}>
      <div className="flex flex-col gap-500">
        {/* 상단: 이미지 + 외부링크 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-400">
            {club.profileImageUrl && (
              <Image
                src={club.profileImageUrl}
                alt={club.name}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
            )}
          </div>
          <Link
            href="/home"
            className="text-icon-alternative hover:text-icon-normal transition-colors"
          >
            <Icon src={ExitIcon} size={20} alt="클럽 홈으로 이동" />
          </Link>
        </div>
        <div className="flex flex-col gap-100 pt-[6px]">
          <span className="typo-sub1 text-text-strong">{club.name}</span>
          {club.description && (
            <p className="typo-body2 text-text-alternative line-clamp-1">{club.description}</p>
          )}
        </div>

        {/* 멤버 수 */}
        <div className="text-text-alternative flex items-center gap-200">
          <Icon src={PeopleIcon} size={16} className="text-icon-normal" />
          <span className="typo-button2 text-text-normal">{club.memberCount}명</span>
        </div>

        {/* 활동 기수 */}
        <div className="flex flex-col gap-200">
          <span className="typo-caption1 text-text-alternative">활동 기수</span>
          <div className="flex flex-wrap gap-100">
            {club.cardinals.length > 0 ? (
              <div className="flex items-center gap-100">
                {club.cardinals.map((gen) => (
                  <Tag key={gen} className="bg-brand-primary/10 text-brand-primary">
                    {gen}기
                  </Tag>
                ))}
              </div>
            ) : (
              <Button variant={'secondary'} size={'md'} className="w-full">
                기수 설정하기
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { ClubInfoCard, type ClubInfoCardProps };
