import type { Metadata } from 'next';
import { MemberPostsContent } from '@/components/member/MemberPostsContent';

export const metadata: Metadata = { title: '부원 게시글' };

export default function MemberPostsPage() {
  return <MemberPostsContent />;
}
