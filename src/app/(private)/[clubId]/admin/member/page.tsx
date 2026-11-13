import type { Metadata } from 'next';
import { MemberPageContent } from '@/components/admin/member/MemberPageContent';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { getClubFeatures } from '@/flags/club-features/server';

export const metadata: Metadata = { title: '운영진 · 부원 관리' };

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  const features = await getClubFeatures(clubId);
  return (
    <ClubFeatureProvider key={`${clubId}:${features.warningEnabled}`} features={features}>
      <MemberPageContent />
    </ClubFeatureProvider>
  );
}
