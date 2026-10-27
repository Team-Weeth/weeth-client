import type { Metadata } from 'next';
import { DuesSetupStep3 } from '@/components/admin/dues/setup/DuesSetupStep3';

export const metadata: Metadata = { title: '운영진 · 회비 설정' };

export default function DuesSetupStep3Page() {
  return <DuesSetupStep3 />;
}
