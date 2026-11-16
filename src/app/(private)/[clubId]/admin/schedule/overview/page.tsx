import { redirect } from 'next/navigation';
import { SchedulePageContent } from '@/components/admin/schedule/general/SchedulePageContent';
import { getClubFeatures } from '@/flags/club-features/server';
import { toURLSearchParams } from '@/utils/shared/url';

interface ScheduleOverviewPageProps {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ScheduleOverviewPage({
  params,
  searchParams,
}: ScheduleOverviewPageProps) {
  const { clubId } = await params;
  const { adminScheduleV2Enabled } = await getClubFeatures(clubId);

  // 개편 전에는 목록형 화면이 `/admin/schedule`에 있으므로 쿼리를 유지한 채 되돌린다.
  if (!adminScheduleV2Enabled) {
    const query = toURLSearchParams(await searchParams).toString();
    redirect(`/${clubId}/admin/schedule${query ? `?${query}` : ''}`);
  }

  return <SchedulePageContent />;
}
