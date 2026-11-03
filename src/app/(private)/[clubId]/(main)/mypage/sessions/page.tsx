import type { Metadata } from 'next';
import { MyPageSessionsContent } from '@/components/mypage/MyPageSessionsContent';

export const metadata: Metadata = { title: '세션 기록' };

export default function MyPageSessionsPage() {
  return <MyPageSessionsContent />;
}
