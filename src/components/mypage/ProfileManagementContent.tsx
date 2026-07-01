'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { AddRoundIcon, BackIcon } from '@/assets/icons';
import { useRouter } from 'next/navigation';
import { AddProfileModal } from './AddProfileModal';
import { ProfileCard } from './ProfileCard';

type ProfileManagementContentProps = React.HTMLAttributes<HTMLDivElement>;

function ProfileManagementContent({ className, ...props }: ProfileManagementContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const [, { data: clubs = [] }] = useMyPageQueries(clubId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-6', className)} {...props}>
      <div className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="typo-h3 text-text-normal">프로필 관리</h1>
          <p className="typo-body2 text-text-alternative">
            같은 프로필을 사용하는 동아리에는 프로필 사진, 이름, 소개글이 함께 반영돼요.
          </p>
        </div>
      </div>

      <div className="bg-container-neutral flex flex-col rounded-lg p-450">
        <p className="typo-sub1 text-text-alternative mb-[18px]">사용 중인 프로필 {clubs.length}</p>
        <div className="grid grid-cols-3 gap-x-300 gap-y-8">
          {clubs.map((club) => (
            <ProfileCard
              key={club.id}
              profile={club}
              clubs={[club]}
              clubId={clubId}
              availableProfiles={clubs}
            />
          ))}
          {/* TODO: mock — 빈 프로필 empty state 확인용 */}
          <ProfileCard
            profile={{
              id: 'mock-empty',
              name: '프로필 2',
              schoolName: '',
              description: '소개글입니다.',
              profileImageUrl: '',
              memberCount: 0,
              cardinals: [],
              memberRole: 'USER',
              memberStatus: 'ACTIVE',
            }}
            clubs={[]}
            clubId={clubId}
            availableProfiles={clubs}
          />
          {/* TODO: mock — 클럽 2개 확인용 */}
          <ProfileCard
            profile={{
              id: 'mock-multi',
              name: '프로필 4',
              schoolName: '',
              description: '반가워용',
              profileImageUrl: '',
              memberCount: 0,
              cardinals: [],
              memberRole: 'USER',
              memberStatus: 'ACTIVE',
            }}
            clubs={[
              {
                id: 'mock-c1',
                name: '가천대 검도부',
                schoolName: '가천대',
                description: '',
                profileImageUrl: '',
                memberCount: 0,
                cardinals: [],
                memberRole: 'USER',
                memberStatus: 'ACTIVE',
              },
              {
                id: 'mock-c2',
                name: '가천대 테니스부',
                schoolName: '가천대',
                description: '',
                profileImageUrl: '',
                memberCount: 0,
                cardinals: [],
                memberRole: 'USER',
                memberStatus: 'ACTIVE',
              },
            ]}
            clubId={clubId}
            availableProfiles={clubs}
          />
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="mt-6 gap-100"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Icon src={AddRoundIcon} size={13} className="text-icon-normal" />
          <span className="typo-button1 text-text-strong">프로필 추가하기</span>
        </Button>
      </div>

      <AddProfileModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
export { ProfileManagementContent, type ProfileManagementContentProps };
