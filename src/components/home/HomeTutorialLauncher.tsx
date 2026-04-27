'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { useHomeQuery } from '@/hooks/home';

import { HomeTutorialDialog } from './HomeTutorialDialog';
import { HomeTutorialButton } from './HomeTutorialButton';

const HOME_TUTORIAL_SEEN_KEY = 'home-tutorial-seen';

function subscribeTutorialSeen(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('storage', callback);
  };
}

function getTutorialSeenSnapshot() {
  return window.localStorage.getItem(HOME_TUTORIAL_SEEN_KEY) === 'true';
}

function HomeTutorialLauncher() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });
  const hasSeenTutorial = useSyncExternalStore(
    subscribeTutorialSeen,
    getTutorialSeenSnapshot,
    () => false,
  );
  const onboarding = searchParams.get('onboarding');
  const isDialogOpen = open || autoOpen;

  useEffect(() => {
    if (onboarding !== 'club-created' || role === undefined) return;

    if (role === 'LEAD' && !hasSeenTutorial) {
      setAutoOpen(true);
    }
    router.replace(`/${clubId}/home`, { scroll: false });
  }, [router, clubId, onboarding, role, hasSeenTutorial]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && autoOpen) {
      window.localStorage.setItem(HOME_TUTORIAL_SEEN_KEY, 'true');
      setAutoOpen(false);
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
