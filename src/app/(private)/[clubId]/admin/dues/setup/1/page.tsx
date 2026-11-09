import type { Metadata } from 'next';
import { DuesSetupStep1 } from '@/components/admin/dues/setup/DuesSetupStep1';

export const metadata: Metadata = { title: '운영진 · 회비 설정' };

export default function DuesSetupStep1Page() {
  return <DuesSetupStep1 />;
}
