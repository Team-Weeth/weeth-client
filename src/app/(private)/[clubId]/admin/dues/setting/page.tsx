import type { Metadata } from 'next';
import { DuesSettingPageContent } from '@/components/admin/dues/DuesSettingPageContent';

export const metadata: Metadata = { title: '운영진 · 회비 설정' };

export default function DuesSettingPage() {
  return <DuesSettingPageContent />;
}
