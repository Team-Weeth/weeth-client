import { Footer } from '@/components/layout';
import { NoticeBoardBox, CalendarBox } from '@/components/home';

export function RightContainer() {
  return (
    <>
      <NoticeBoardBox />
      <CalendarBox />
      <Footer isSmall />
    </>
  );
}
