'use client';

import dynamic from 'next/dynamic';
import { HomeTutorialLauncher } from '@/components/home/HomeTutorialLauncher';
import { NoticePopup } from '@/components/home/NoticePopup';
import { useHomeGuard } from '@/hooks/home';
import { BannerSkeleton } from '@/components/home/skeleton';
import {
  LeftContainerSkeleton,
  MainContainerSkeleton,
  RightContainerSkeleton,
} from '@/components/home/skeleton/HomeSectionSkeletons';

const HomePageSections = dynamic(
  () => import('@/components/home/HomePageSections').then((m) => m.HomePageSections),
  {
    ssr: false,
    loading: () => <HomePageSkeleton />,
  },
);

function HomePageSkeleton() {
  return (
    <>
      <BannerSkeleton />
      <div className="tablet:flex-row desktop:px-16 flex w-full flex-col gap-8 px-[18px] py-450">
        <div className="tablet:w-[304px] tablet:shrink-0 flex flex-col gap-300">
          <LeftContainerSkeleton />
          <div className="desktop:hidden tablet:flex hidden flex-col gap-300">
            <RightContainerSkeleton />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-300">
          <MainContainerSkeleton />
        </div>
        <div className="desktop:flex desktop:w-[339px] desktop:shrink-0 tablet:hidden flex flex-col gap-300">
          <RightContainerSkeleton />
        </div>
      </div>
    </>
  );
}

export function HomePageEntry() {
  useHomeGuard();

  return (
    <>
      <NoticePopup />
      <HomeTutorialLauncher />
      <HomePageSections />
    </>
  );
}
