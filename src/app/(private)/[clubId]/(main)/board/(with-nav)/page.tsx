import type { Metadata } from 'next';
import { BoardContent } from '@/components/board/BoardContent';

export const metadata: Metadata = { title: '게시판' };

export default function BoardPage() {
  return <BoardContent boardId={null} />;
}
