'use client';

import PeopleIcon from '@/assets/icons/people.svg';
import CopyIcon from '@/assets/icons/copy.svg';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import dynamic from 'next/dynamic';
import { copyTextToClipboard } from '@/utils/shared/clipboard';
import { getAppOrigin } from '@/utils/shared';
import { AlertBanner } from './AlertBanner';
const CardinalMissingModal = dynamic(() =>
  import('./CardinalMissingModal').then((m) => m.CardinalMissingModal),
);
const ProfileIncompleteModal = dynamic(() =>
  import('./ProfileIncompleteModal').then((m) => m.ProfileIncompleteModal),
);
import { useWritePost } from '@/hooks/home/useWritePost';

interface ClubActionsProps {
  memberCount?: number;
  clubId?: string;
  clubName?: string;
  clubCode?: string;
}

export function ClubActions({ memberCount, clubId, clubName, clubCode }: ClubActionsProps) {
  const handleCopyInvite = () => {
    if (!clubId || !clubName || !clubCode) return;

    return copyTextToClipboard(`${getAppOrigin()}/clubId=${clubId}?code=${clubCode}`, {
      successMessage: '초대 링크가 복사되었습니다.',
      errorMessage: '초대 링크 복사에 실패했습니다.',
    });
  };

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
          <Icon src={PeopleIcon} alt="people" size={20} className="text-icon-normal" />
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
