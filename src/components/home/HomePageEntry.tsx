'use client';

import dynamic from 'next/dynamic';
import { HomeTutorialLauncher } from '@/components/home/HomeTutorialLauncher';
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
      <div className="tablet:flex-row desktop:px-16 flex w-full flex-col gap-8 px-[18px]">
        <div className="flex flex-col gap-300">
          <LeftContainerSkeleton />
        </div>
        <div className="flex w-full flex-col gap-300">
          <MainContainerSkeleton />
        </div>
        <div className="desktop:flex hidden flex-col gap-300">
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
      <HomeTutorialLauncher />
      <HomePageSections />
    </>
  );
}
