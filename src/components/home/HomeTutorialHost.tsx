'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { HomeTutorialSlide } from '@/constants/home/tutorial';
import { HomeTutorialDialog } from '@/components/home/HomeTutorialDialog';

const HomeProfileSetupModal = dynamic(() =>
  import('@/components/home/HomeProfileSetupModal').then((m) => m.HomeProfileSetupModal),
);

interface HomeTutorialHostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slides: HomeTutorialSlide[];
}

/** 튜토리얼 다이얼로그와 슬라이드 보조 액션(프로필 설정 모달)을 함께 렌더링한다. */
function HomeTutorialHost({ open, onOpenChange, slides }: HomeTutorialHostProps) {
  const [profileSetupModalOpen, setProfileSetupModalOpen] = useState(false);

  return (
    <>
      {slides.length > 0 && (
        <HomeTutorialDialog
          open={open}
          onOpenChange={onOpenChange}
          slides={slides}
          onSecondaryAction={(action) => {
            if (action === 'open-profile-setup-modal') {
              setProfileSetupModalOpen(true);
            }
          }}
        />
      )}
      <HomeProfileSetupModal open={profileSetupModalOpen} onOpenChange={setProfileSetupModalOpen} />
    </>
  );
}

export { HomeTutorialHost, type HomeTutorialHostProps };
