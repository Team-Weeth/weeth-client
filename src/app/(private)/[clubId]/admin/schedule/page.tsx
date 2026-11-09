import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ScheduleManagementContent } from '@/components/admin/schedule/general/ScheduleManagementContent';

export const metadata: Metadata = { title: '운영진 · 일정 관리' };

interface SchedulePageProps {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SchedulePage({ params, searchParams }: SchedulePageProps) {
  const resolvedSearchParams = await searchParams;

  if (resolvedSearchParams.tab !== undefined) {
    const { clubId } = await params;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (Array.isArray(value)) {
        value.forEach((v) => query.append(key, v));
      } else if (value !== undefined) {
        query.set(key, value);
      }
    }
    redirect(`/${clubId}/admin/schedule/overview?${query.toString()}`);
  }

  return <ScheduleManagementContent />;
}
