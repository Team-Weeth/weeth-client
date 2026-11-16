import type { Metadata } from 'next';
import { DuesSetupStep2 } from '@/components/admin/dues/setup/DuesSetupStep2';

export const metadata: Metadata = { title: '운영진 · 회비 설정' };

export default function DuesSetupStep2Page() {
  return <DuesSetupStep2 />;
}
