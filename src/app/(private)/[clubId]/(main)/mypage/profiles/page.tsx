import type { Metadata } from 'next';
import { ProfileManagementContent } from '@/components/mypage/ProfileManagementContent';

export const metadata: Metadata = { title: '프로필 관리' };
export const dynamic = 'force-dynamic';

export default function ProfilesPage() {
  return <ProfileManagementContent />;
}
