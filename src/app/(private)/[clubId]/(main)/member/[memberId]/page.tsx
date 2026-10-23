import type { Metadata } from 'next';
import { MemberDetailContent } from '@/components/member/MemberDetailContent';

export const metadata: Metadata = { title: '부원 정보' };

export default function MemberDetailPage() {
  return <MemberDetailContent />;
}
