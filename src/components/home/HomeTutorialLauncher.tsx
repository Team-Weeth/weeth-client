'use client';

import { useEffect, useRef, useState } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { useHomeQuery } from '@/hooks/home';

import { HomeTutorialDialog } from './HomeTutorialDialog';
import { HomeTutorialButton } from './HomeTutorialButton';

const HOME_TUTORIAL_SEEN_KEY = 'home-tutorial-seen';

function HomeTutorialLauncher() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const autoOpenedRef = useRef(false);
  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });

  useEffect(() => {
    const onboarding = searchParams.get('onboarding');

    if (
      onboarding === 'club-created' &&
      role === 'LEAD' &&
      window.localStorage.getItem(HOME_TUTORIAL_SEEN_KEY) !== 'true'
    ) {
      autoOpenedRef.current = true;
      setOpen(true);
    }

    if (onboarding === 'club-created') {
      router.replace(`/${clubId}/home`, { scroll: false });
    }
  }, [router, searchParams, clubId, role]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && autoOpenedRef.current) {
      window.localStorage.setItem(HOME_TUTORIAL_SEEN_KEY, 'true');
      autoOpenedRef.current = false;
    }

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
