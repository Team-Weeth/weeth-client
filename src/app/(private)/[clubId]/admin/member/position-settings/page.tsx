import type { Metadata } from 'next';
import { MemberPositionPageContent } from '@/components/admin/member/MemberPositionPageContent';

export const metadata: Metadata = { title: '운영진 · 직책 설정' };

export default function PositionSettingsPage() {
  return <MemberPositionPageContent />;
}
