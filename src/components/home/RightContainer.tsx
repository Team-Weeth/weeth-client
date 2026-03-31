import { Footer } from '@/components/layout';
import { NoticeBoardBox } from './NoticeBoardBox';
import { CalendarBox } from './CalendarBox';

export function RightContainer() {
  return (
    <>
      <NoticeBoardBox />
      <CalendarBox />
      <Footer isSmall />
    </>
  );
}
