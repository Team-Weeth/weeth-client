import type { Metadata } from 'next';
import { BoardPageContent } from '@/components/admin/board/BoardPageContent';

export const metadata: Metadata = { title: '운영진 · 게시판 관리' };

export default function BoardPage() {
  return <BoardPageContent />;
}
