import type { Metadata } from 'next';
import { AddProfilePageContent } from '@/components/mypage/AddProfilePageContent';

export const metadata: Metadata = { title: '프로필 추가' };
export const dynamic = 'force-dynamic';

export default function AddProfilePage() {
  return <AddProfilePageContent />;
}
