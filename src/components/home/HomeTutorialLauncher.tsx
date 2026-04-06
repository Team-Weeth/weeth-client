'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useHomeQuery } from '@/hooks/home';

import { HomeTutorialDialog } from './HomeTutorialDialog';
import { HomeTutorialButton } from './HomeTutorialButton';

const HOME_TUTORIAL_SEEN_KEY = 'home-tutorial-seen';

function HomeTutorialLauncher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const onboarding = searchParams.get('onboarding');
    if (onboarding !== 'club-created') return false;
    if (window.localStorage.getItem(HOME_TUTORIAL_SEEN_KEY) === 'true') return false;
    window.localStorage.setItem(HOME_TUTORIAL_SEEN_KEY, 'true');
    return true;
  });
  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });

  useEffect(() => {
    const onboarding = searchParams.get('onboarding');
    if (onboarding === 'club-created') {
      router.replace('/home', { scroll: false });
    }
  }, [router, searchParams]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };

  return (
    <>
      {role === 'LEAD' && <HomeTutorialButton onClick={() => setOpen(true)} />}

      <HomeTutorialDialog open={open} onOpenChange={handleOpenChange} />
    </>
  );
}

export { HomeTutorialLauncher };
