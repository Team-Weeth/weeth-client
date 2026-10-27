import type { Metadata } from 'next';
import { DuesSetupStep4 } from '@/components/admin/dues/setup/DuesSetupStep4';

export const metadata: Metadata = { title: '운영진 · 회비 설정' };

export default function DuesSetupStep4Page() {
  return <DuesSetupStep4 />;
}
