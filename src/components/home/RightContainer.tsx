import { Footer } from '@/components/layout';
import { NoticeBoardBox } from './NoticeBoardBox';
import { CalendarBox } from './CalendarBox';

interface RightContainerProps {
  showFooter?: boolean;
}

export function RightContainer({ showFooter = true }: RightContainerProps) {
  return (
    <>
      <NoticeBoardBox />
      <CalendarBox />
      {showFooter ? <Footer isSmall /> : null}
    </>
  );
}
