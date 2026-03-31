'use client';

import { Suspense, useEffect } from 'react';
import {
  BannerSkeleton,
  LeftContainerSkeleton,
  MainContainerSkeleton,
  RightContainerSkeleton,
} from '@/components/home/skeleton/HomeSectionSkeletons';
import {
  Banner,
  LeftContainer,
  MainContainer,
  RightContainer,
} from '@/components/home/DynamicSections';
import { useHomeQuery } from '@/hooks/home';
import { Header } from '@/components/layout';
import { useUserActions } from '@/stores';

export function HomePageSections() {
  const { setUser } = useUserActions();
  const { data: myUserInfo } = useHomeQuery({
    select: (data) => data.myInfo.userInfo,
  });

  useEffect(() => {
    if (!myUserInfo) return;
    setUser(myUserInfo);
  }, [myUserInfo, setUser]);

  return (
    <>
      <Suspense fallback={<BannerSkeleton />}>
        <Banner />
      </Suspense>
      <Header />
      <div className="flex w-full gap-8 px-16">
        <div className="flex flex-col gap-300">
          <Suspense fallback={<LeftContainerSkeleton />}>
            <LeftContainer />
          </Suspense>
        </div>
        <div className="flex w-full flex-col gap-300">
          <Suspense fallback={<MainContainerSkeleton />}>
            <MainContainer />
          </Suspense>
        </div>
        <div className="flex flex-col gap-300">
          <Suspense fallback={<RightContainerSkeleton />}>
            <RightContainer />
          </Suspense>
        </div>
      </div>
    </>
  );
}
