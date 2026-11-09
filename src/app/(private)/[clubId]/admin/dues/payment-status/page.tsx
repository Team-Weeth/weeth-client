import type { Metadata } from 'next';
import { DuesPaymentStatusPageContent } from '@/components/admin/dues/DuesPaymentStatusPageContent';

export const metadata: Metadata = { title: '운영진 · 납부 현황' };

export default function DuesPaymentStatusPage() {
  return <DuesPaymentStatusPageContent />;
}
