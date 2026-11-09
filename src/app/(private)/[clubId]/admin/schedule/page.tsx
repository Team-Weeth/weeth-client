import type { Metadata } from 'next';
import { ScheduleManagementContent } from '@/components/admin/schedule/general/ScheduleManagementContent';

export const metadata: Metadata = { title: '운영진 · 일정 관리' };

export default function SchedulePage() {
  return <ScheduleManagementContent />;
}
