import { UnreadNoticeBox } from '@/components/home';
import { BoardContent } from '../board';

export function MainContainer() {
  return (
    <>
      <UnreadNoticeBox />
      <BoardContent />
    </>
  );
}
