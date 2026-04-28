'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { useParams } from 'next/navigation';

import { useHomeQuery } from '@/hooks/home';

import { HomeTutorialDialog } from './HomeTutorialDialog';
import { HomeTutorialButton } from './HomeTutorialButton';

const HOME_TUTORIAL_PENDING_KEY = 'home-tutorial-pending-club-id';
const HOME_TUTORIAL_SEEN_KEY_PREFIX = 'home-tutorial-seen';

function subscribeTutorialSeen(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('storage', callback);
  };
}

function getTutorialSeenKey(clubId: string) {
  return `${HOME_TUTORIAL_SEEN_KEY_PREFIX}:${clubId}`;
}

function HomeTutorialLauncher() {
  const { clubId } = useParams<{ clubId: string }>();
  const [open, setOpen] = useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = useState(false);

  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });
  const hasSeenTutorial = useSyncExternalStore(
    subscribeTutorialSeen,
    () => window.localStorage.getItem(getTutorialSeenKey(clubId)) === 'true',
    () => false,
  );
  const pendingClubId = useSyncExternalStore(
    subscribeTutorialSeen,
    () => window.sessionStorage.getItem(HOME_TUTORIAL_PENDING_KEY),
    () => null,
  );

  const shouldAutoOpen =
    pendingClubId === clubId && role === 'LEAD' && !hasSeenTutorial && !autoOpenDismissed;
  const isDialogOpen = open || shouldAutoOpen;

  useEffect(() => {
    if (role === undefined || pendingClubId !== clubId) return;
    if (role !== 'LEAD' || hasSeenTutorial) {
      window.sessionStorage.removeItem(HOME_TUTORIAL_PENDING_KEY);
    }
  }, [clubId, hasSeenTutorial, pendingClubId, role]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && shouldAutoOpen) {
      window.localStorage.setItem(getTutorialSeenKey(clubId), 'true');
      window.sessionStorage.removeItem(HOME_TUTORIAL_PENDING_KEY);
      setAutoOpenDismissed(true);
    }

    setOpen(nextOpen);
  };

  return (
    <>
      {role === 'LEAD' && <HomeTutorialButton onClick={() => setOpen(true)} />}

      <HomeTutorialDialog open={isDialogOpen} onOpenChange={handleOpenChange} />
    </>
  );
}

export { HomeTutorialLauncher };
