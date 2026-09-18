import { MyPagePenaltiesContent } from '@/components/mypage/MyPagePenaltiesContent';
import { getClubFeatures } from '@/flags/club-features/server';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';

export default async function MyPagePenaltiesPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const features = await getClubFeatures(clubId);
  return (
    <ClubFeatureProvider key={clubId} features={features}>
      <MyPagePenaltiesContent />
    </ClubFeatureProvider>
  );
}
