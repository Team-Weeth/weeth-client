import type { Metadata } from 'next';
import { AttendancePageContent } from '@/components/admin/attendance';

export const metadata: Metadata = { title: '운영진 · 출석 관리' };

export default function AttendancePage() {
  return <AttendancePageContent />;
}
