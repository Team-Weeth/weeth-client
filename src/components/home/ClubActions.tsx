'use client';

import Image from 'next/image';
import { PeopleIcon, CopyIcon } from '@/assets/icons';
import { Button, Divider, Icon } from '@/components/ui';
import { AlertBanner } from './AlertBanner';
import { CardinalMissingModal } from './CardinalMissingModal';
import { ProfileIncompleteModal } from './ProfileIncompleteModal';
import { useWritePost } from '@/hooks/home/useWritePost';

interface ClubActionsProps {
  memberCount?: number;
  clubName?: string;
  clubCode?: string;
}

export function ClubActions({ memberCount, clubName, clubCode }: ClubActionsProps) {
  const handleCopyInvite = () =>
    navigator.clipboard.writeText(`${window.location.origin}/${clubName}/code?${clubCode}`);
  const {
    handleWriteClick,
    handleSkipProfile,
    isProfileIncomplete,
    cardinalModalOpen,
    setCardinalModalOpen,
    profileModalOpen,
    setProfileModalOpen,
  } = useWritePost();

  return (
    <>
      <Divider />
      <div className="flex justify-between px-[10px] py-450">
        <div className="flex gap-200">
          <Image src={PeopleIcon} alt="people" width={20} height={20} />
          <p className="typo-button2 text-text-normal">{memberCount}명</p>
        </div>
        <button
          type="button"
          onClick={handleCopyInvite}
          className="typo-button2 text-text-alternative flex cursor-pointer gap-200 underline underline-offset-2"
        >
          초대
          <Icon src={CopyIcon} alt="copy" className="text-icon-alternative" />
        </button>
      </div>
      <Button variant="secondary" size="md" className="w-full" onClick={handleWriteClick}>
        글쓰기
      </Button>
      {isProfileIncomplete && <AlertBanner />}

      <CardinalMissingModal open={cardinalModalOpen} onClose={() => setCardinalModalOpen(false)} />
      <ProfileIncompleteModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSkip={handleSkipProfile}
      />
    </>
  );
}
