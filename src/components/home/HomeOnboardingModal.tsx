'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useHomeQuery } from '@/hooks/home';

import { HomeOnboardingDialog } from './HomeTutorialDialog';

const HOME_ONBOARDING_SEEN_KEY = 'home-onboarding-seen-v1';

function HomeOnboardingModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });

  useEffect(() => {
    const onboarding = searchParams.get('onboarding');
    const hasSeenOnboarding = window.localStorage.getItem(HOME_ONBOARDING_SEEN_KEY) === 'true';

    if (onboarding === 'club-created') {
      router.replace('/home', { scroll: false });
    }

    if (onboarding !== 'club-created' || hasSeenOnboarding) return;

    setOpen(true);
    window.localStorage.setItem(HOME_ONBOARDING_SEEN_KEY, 'true');
  }, [router, searchParams]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };

  return (
    <>
      {role === 'LEAD' && (
        <button
          type="button"
          aria-label="홈 온보딩 다시 보기"
          onClick={() => setOpen(true)}
          className="bg-container-neutral fixed right-500 bottom-500 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-transform hover:scale-105"
        >
          <span className="text-text-strong text-[32px] leading-none">?</span>
        </button>
      )}

      <HomeOnboardingDialog open={open} onOpenChange={handleOpenChange} />
    </>
  );
}

export { HomeOnboardingModal };
