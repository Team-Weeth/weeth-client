'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { useAssignableClubMap, useMyProfilesQuery } from '@/hooks/queries/mypage/useMyPageQueries';
import AddRoundIcon from '@/assets/icons/add_round.svg';
import { useRouter } from 'next/navigation';
import { AddProfileModal } from './AddProfileModal';
import { ProfileCard } from './ProfileCard';
import { ProfileManagementSkeleton } from './skeleton/ProfileManagementSkeleton';
import { MyPageBackButton } from '@/components/mypage/MyPageBackButton';

type ProfileManagementContentProps = React.HTMLAttributes<HTMLDivElement>;

function ProfileManagementContent({ className, ...props }: ProfileManagementContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const isBelowTablet = useIsMobile();
  const profilesQuery = useMyProfilesQuery();
  const { clubMap: assignableClubMap } = useAssignableClubMap();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const profiles = profilesQuery.data ?? [];

  const handleOpenAddProfile = () => {
    if (isBelowTablet) {
      router.push(`/${clubId}/mypage/profiles/add`);
      return;
    }

    setIsAddModalOpen(true);
  };

  if (profilesQuery.isPending) {
    return <ProfileManagementSkeleton />;
  }

  return (
    <div className={cn('tablet:gap-6 flex min-w-0 flex-1 flex-col', className)} {...props}>
      <div className="tablet:items-start tablet:gap-1 flex items-center py-300">
        <MyPageBackButton onClick={() => router.back()} />
        <div className="flex flex-col">
          <h1 className="tablet:typo-h3 typo-sub1 text-text-normal">프로필 관리</h1>
          <p className="tablet:flex typo-body2 text-text-alternative hidden">
            같은 프로필을 사용하는 동아리에는 프로필 사진, 이름, 소개글이 함께 반영돼요.
          </p>
        </div>
      </div>
      <div className="tablet:hidden bg-container-neutral-alternative typo-body2 text-text-normal mb-450 flex w-full rounded-md px-[18px] py-4">
        같은 프로필을 사용하는 동아리에는 프로필 사진, 이름, 소개글이 함께 반영돼요.
      </div>

      <div className="bg-container-neutral flex flex-col rounded-lg p-450">
        <p className="typo-sub1 text-text-alternative mb-[18px]">
          사용 중인 프로필 {profiles.length}
        </p>
        <div className="desktop:grid desktop:grid-cols-3 desktop:gap-x-300 desktop:gap-y-8 flex flex-col gap-8">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.profileId}
              profile={profile}
              clubs={profile.clubs}
              clubId={clubId}
              availableProfiles={profiles}
              assignableClubMap={assignableClubMap}
            />
          ))}
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="mt-6 gap-100"
          onClick={handleOpenAddProfile}
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
