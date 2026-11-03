import type { Metadata } from 'next';
import { EditProfilePageContent } from '@/components/mypage/EditProfilePageContent';

export const metadata: Metadata = { title: '프로필 수정' };
export const dynamic = 'force-dynamic';

export default function EditProfilePage() {
  return <EditProfilePageContent />;
}
