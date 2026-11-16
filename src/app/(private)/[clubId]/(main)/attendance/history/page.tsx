import type { Metadata } from 'next';
import { AttendanceHistoryContent } from '@/components/attendance/AttendanceHistoryContent';

export const metadata: Metadata = { title: '출석 내역' };

export default function AttendanceHistoryPage() {
  return <AttendanceHistoryContent />;
}
