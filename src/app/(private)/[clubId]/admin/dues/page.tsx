import type { Metadata } from 'next';
import { DuesPageContent } from '@/components/admin/dues/DuesPageContent';

export const metadata: Metadata = { title: '운영진 · 회비 관리' };

export default function DuesPage() {
  return <DuesPageContent />;
}
