import type { Metadata } from 'next';
import { SchedulePageContent } from '@/components/admin/schedule/general/SchedulePageContent';

export const metadata: Metadata = { title: '운영진 · 일정 관리' };

export default function SchedulePage() {
  return <SchedulePageContent />;
}
