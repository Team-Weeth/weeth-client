import type { Metadata } from 'next';
import { DuesSetupStep5 } from '@/components/admin/dues/setup/DuesSetupStep5';

export const metadata: Metadata = { title: '운영진 · 회비 설정' };

export default function DuesSetupStep5Page() {
  return <DuesSetupStep5 />;
}
