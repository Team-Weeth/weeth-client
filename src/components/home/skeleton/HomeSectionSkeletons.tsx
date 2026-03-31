import {
  BannerSkeleton,
  CalendarBoxSkeleton,
  ClubInfoBoxSkeleton,
  HomeBoardContentSkeleton,
  NoticeBoardBoxSkeleton,
  TodayScheduleBoxSkeleton,
  UnreadNoticeBoxSkeleton,
} from '@/components/home/skeleton';

export function LeftContainerSkeleton() {
  return (
    <>
      <ClubInfoBoxSkeleton />
      <TodayScheduleBoxSkeleton />
    </>
  );
}

export function MainContainerSkeleton() {
  return (
    <>
      <UnreadNoticeBoxSkeleton />
      <HomeBoardContentSkeleton />
    </>
  );
}

export function RightContainerSkeleton() {
  return (
    <>
      <NoticeBoardBoxSkeleton />
      <CalendarBoxSkeleton />
    </>
  );
}

export { BannerSkeleton };
