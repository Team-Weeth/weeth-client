'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditIcon from '@/assets/icons/edit.svg';
import InfoCircleIcon from '@/assets/icons/info_circle.svg';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Avatar, AvatarFallback, AvatarImage, Button, Icon } from '@/components/ui';
import type {
  MyPageAssignableClub,
  MyPageUsingProfile,
  MyPageUsingProfileClub,
} from '@/types/mypage';
import { EditProfileModal } from './EditProfileModal';
import { ProfileSelectModal } from './ProfileSelectModal';

interface ProfileCardProps {
  profile: MyPageUsingProfile;
  clubs: MyPageUsingProfileClub[];
  clubId: string;
  availableProfiles: MyPageUsingProfile[];
  assignableClubMap: Map<string, MyPageAssignableClub>;
}

function ProfileCard({
  profile,
  clubs,
  clubId,
  availableProfiles,
  assignableClubMap,
}: ProfileCardProps) {
  const router = useRouter();
  const isBelowTablet = useMediaQuery('(max-width: 695.98px)');
  const [selectedClub, setSelectedClub] = useState<MyPageAssignableClub | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenEditProfile = () => {
    if (isBelowTablet) {
      router.push(`/${clubId}/mypage/profiles/${profile.profileId}/edit`);
      return;
    }

    setIsEditModalOpen(true);
  };

  return (
    <>
      <div className="bg-container-neutral flex w-full flex-col gap-[18px] rounded-lg">
        <div className="bg-container-neutral-alternative relative flex items-center gap-300 rounded-md p-450">
          <Avatar size={64} type="round">
            <AvatarImage src={profile.profileImageUrl ?? undefined} alt={profile.name} />
            <AvatarFallback />
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
            <p className="typo-sub3 text-text-strong line-clamp-1">{profile.name}</p>
            {profile.bio && (
              <p className="typo-body2 text-text-alternative line-clamp-1">{profile.bio}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleOpenEditProfile}
            className="absolute top-2 right-2 cursor-pointer p-1"
            aria-label="프로필 수정"
          >
            <Icon src={EditIcon} size={20} className="text-icon-alternative" />
          </button>
        </div>

        {clubs.length === 0 ? (
          <div className="flex items-center gap-1">
            <Icon src={InfoCircleIcon} size={18} className="text-[#CECFCF]" />
            <span className="typo-body2 text-text-alternative">사용하는 동아리가 없습니다.</span>
          </div>
        ) : (
          <div className="divide-line divide-y">
            {clubs.map((club) => {
              const assignableClub = assignableClubMap.get(club.clubId);

              return (
                <div
                  key={club.clubId}
                  className="flex items-center justify-between py-[14px] first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-200">
                    <Avatar size={36} type="square">
                      <AvatarImage
                        src={assignableClub?.clubImage ?? undefined}
                        alt={assignableClub?.name ?? club.name}
                      />
                      <AvatarFallback variant="club" />
                    </Avatar>
                    <span className="desktop:typo-body2 typo-sub3 text-text-normal">
                      {assignableClub?.name ?? club.name}
                    </span>
                  </div>
                  <Button
                    variant="primarySoft"
                    size="sm"
                    onClick={() =>
                      setSelectedClub(
                        assignableClub ?? {
                          clubId: club.clubId,
                          name: club.name,
                          clubImage: null,
                          clubMemberNumber: 0,
                        },
                      )
                    }
                  >
                    변경
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedClub && (
        <ProfileSelectModal
          open={!!selectedClub}
          club={selectedClub}
          currentProfileId={String(profile.profileId)}
          profiles={availableProfiles}
          onOpenChange={(open) => {
            if (!open) setSelectedClub(null);
          }}
        />
      )}

      <EditProfileModal
        open={isEditModalOpen}
        profile={profile}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  );
}

export { ProfileCard, type ProfileCardProps };
