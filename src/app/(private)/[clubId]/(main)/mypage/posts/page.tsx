import type { Metadata } from 'next';
import { MyPagePostsContent } from '@/components/mypage/MyPagePostsContent';

export const metadata: Metadata = { title: '내 게시글' };
export const dynamic = 'force-dynamic';

export default function MyPagePostsPage() {
  return <MyPagePostsContent />;
}
