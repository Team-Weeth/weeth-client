import type { Metadata } from 'next';
import { MemberPageContent } from '@/components/admin/member/MemberPageContent';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { getClubFeatures } from '@/flags/club-features/server';
import { homeServerApi } from '@/lib/apis/home.server';

export const metadata: Metadata = { title: '운영진 · 부원 관리' };

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  const { data } = await homeServerApi.getDashboard(clubId);
  const features = await getClubFeatures(clubId, String(data.myInfo.userInfo.id));
  return (
    <ClubFeatureProvider key={`${clubId}:${features.warningEnabled}`} features={features}>
      <MemberPageContent />
    </ClubFeatureProvider>
  );
}
