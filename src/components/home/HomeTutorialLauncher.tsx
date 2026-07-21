'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useHomeQuery } from '@/hooks/home';
import {
  HOME_TUTORIAL_SLIDES,
  getHomeTutorialPendingKey,
  getHomeTutorialSeenKey,
  getHomeTutorialVariantByRole,
} from '@/constants/home/tutorial';
import { HomeTutorialDialog } from './HomeTutorialDialog';
import { HomeTutorialButton } from './HomeTutorialButton';
const HomeProfileSetupModal = dynamic(() =>
  import('./HomeProfileSetupModal').then((m) => m.HomeProfileSetupModal),
);

function subscribeTutorialSeen(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('storage', callback);
  };
}

function HomeTutorialLauncher() {
  const { clubId } = useParams<{ clubId: string }>();
  const [open, setOpen] = useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = useState(false);
  const [profileSetupModalOpen, setProfileSetupModalOpen] = useState(false);

  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });
  const tutorialVariant = getHomeTutorialVariantByRole(role);
  const slides = tutorialVariant ? HOME_TUTORIAL_SLIDES[tutorialVariant] : [];
  const hasSeenTutorial = useSyncExternalStore(
    subscribeTutorialSeen,
    () =>
      tutorialVariant
        ? window.localStorage.getItem(getHomeTutorialSeenKey(clubId, tutorialVariant)) === 'true'
        : false,
    () => false,
  );
  const pendingLeadClubId = useSyncExternalStore(
    subscribeTutorialSeen,
    () => window.sessionStorage.getItem(getHomeTutorialPendingKey('lead')),
    () => null,
  );
  const pendingMemberClubId = useSyncExternalStore(
    subscribeTutorialSeen,
    () => window.sessionStorage.getItem(getHomeTutorialPendingKey('member')),
    () => null,
  );
  const pendingClubId =
    tutorialVariant === 'lead'
      ? pendingLeadClubId
      : tutorialVariant === 'member'
        ? pendingMemberClubId
        : null;

  const shouldAutoOpen =
    tutorialVariant !== null && pendingClubId === clubId && !hasSeenTutorial && !autoOpenDismissed;
  const isDialogOpen = open || shouldAutoOpen;

  useEffect(() => {
    if (!tutorialVariant || pendingClubId !== clubId) return;
    if (hasSeenTutorial) {
      window.sessionStorage.removeItem(getHomeTutorialPendingKey(tutorialVariant));
    }
  }, [clubId, hasSeenTutorial, pendingClubId, tutorialVariant]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && shouldAutoOpen && tutorialVariant) {
      window.localStorage.setItem(getHomeTutorialSeenKey(clubId, tutorialVariant), 'true');
      window.sessionStorage.removeItem(getHomeTutorialPendingKey(tutorialVariant));
      setAutoOpenDismissed(true);
    }

    setOpen(nextOpen);
  };

  return (
    <>
      {tutorialVariant && <HomeTutorialButton onClick={() => setOpen(true)} />}

      {slides.length > 0 && (
        <HomeTutorialDialog
          open={isDialogOpen}
          onOpenChange={handleOpenChange}
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

export { HomeTutorialLauncher };
