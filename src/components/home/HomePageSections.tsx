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

export function HomePageSections() {
  return (
    <>
      <Suspense fallback={<BannerSkeleton />}>
        <Banner />
      </Suspense>
      <div className="tablet:flex-row desktop:px-16 flex w-full flex-col gap-8 px-[18px] py-450">
        <div className="tablet:w-[304px] tablet:shrink-0 flex flex-col gap-300">
          <Suspense fallback={<LeftContainerSkeleton />}>
            <LeftContainer />
          </Suspense>
          <div className="desktop:hidden tablet:flex hidden flex-col gap-300">
            <Suspense fallback={<RightContainerSkeleton />}>
              <RightContainer showFooter={false} />
            </Suspense>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-300">
          <Suspense fallback={<MainContainerSkeleton />}>
            <MainContainer />
          </Suspense>
        </div>
        <div className="desktop:flex tablet:hidden flex flex-col gap-300">
          <Suspense fallback={<RightContainerSkeleton />}>
            <RightContainer />
          </Suspense>
        </div>
      </div>
    </>
  );
}
