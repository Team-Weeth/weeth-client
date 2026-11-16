import type { Metadata } from 'next';
import { MemberPageContent } from '@/components/member/MemberPageContent';

export const metadata: Metadata = { title: '멤버 목록' };

export default function MemberPage() {
  return <MemberPageContent />;
}
