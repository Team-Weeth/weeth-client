import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ScheduleManagementContent } from '@/components/admin/schedule/general/ScheduleManagementContent';
import { SchedulePageContent } from '@/components/admin/schedule/general/SchedulePageContent';
import { getClubFeatures } from '@/flags/club-features/server';
import { toURLSearchParams } from '@/utils/shared/url';

export const metadata: Metadata = { title: '운영진 · 일정 관리' };

interface SchedulePageProps {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SchedulePage({ params, searchParams }: SchedulePageProps) {
  const { clubId } = await params;
  const { adminScheduleV2Enabled } = await getClubFeatures(clubId);

  // 개편 전 화면은 목록형 화면이 이 경로에서 `tab` 쿼리까지 직접 처리한다.
  if (!adminScheduleV2Enabled) return <SchedulePageContent />;

  const resolvedSearchParams = await searchParams;

  if (resolvedSearchParams.tab !== undefined) {
    redirect(`/${clubId}/admin/schedule/overview?${toURLSearchParams(resolvedSearchParams)}`);
  }

  return <ScheduleManagementContent />;
}
