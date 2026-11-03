import type { Metadata } from 'next';
import { MyPageClientWrapper } from '@/components/mypage/MyPageClientWrapper';

export const metadata: Metadata = { title: '마이페이지' };
export const dynamic = 'force-dynamic';

export default function MyPagePage() {
  return <MyPageClientWrapper />;
}
