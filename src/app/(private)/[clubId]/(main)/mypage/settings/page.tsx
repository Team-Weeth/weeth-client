import type { Metadata } from 'next';
import { MyPageSettingsContent } from '@/components/mypage/MyPageSettingsContent';

export const metadata: Metadata = { title: '설정' };
export const dynamic = 'force-dynamic';

export default function MyPageSettingsPage() {
  return <MyPageSettingsContent />;
}
