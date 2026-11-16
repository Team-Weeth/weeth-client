import type { Metadata } from 'next';
import { MyPageActivityContent } from '@/components/mypage/MyPageActivityContent';

export const metadata: Metadata = { title: '활동 내역' };
export const dynamic = 'force-dynamic';

export default function MyPageActivityPage() {
  return <MyPageActivityContent />;
}
