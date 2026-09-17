import { MemberPageContent } from '@/components/admin/member/MemberPageContent';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { getClubFeatures } from '@/flags/club-features/server';

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  const features = await getClubFeatures(clubId);
  return (
    <ClubFeatureProvider key={`${clubId}:${features.warningEnabled}`} features={features}>
      <MemberPageContent />
    </ClubFeatureProvider>
  );
}
