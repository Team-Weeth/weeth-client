'use client';

import { Suspense } from 'react';
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
import { Header } from '@/components/layout';

export function HomePageSections() {
  return (
    <>
      <Header />
      <Suspense fallback={<BannerSkeleton />}>
        <Banner />
      </Suspense>
      <div className="tablet:flex-row flex w-full flex-col gap-8 px-[18px] py-450">
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
        <div className="desktop:flex hidden flex-col gap-300">
          <Suspense fallback={<RightContainerSkeleton />}>
            <RightContainer />
          </Suspense>
        </div>
      </div>
    </>
  );
}
