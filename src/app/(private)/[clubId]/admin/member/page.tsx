import { isFeatureEnabled } from '@/lib/flagsmith';
import { MemberPageContent } from '@/components/admin/member/MemberPageContent';

export default async function MemberPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  const warningEnabled = await isFeatureEnabled('club_warning_enabled', {
    identifier: `club:${clubId}`,
    traits: { club_id: clubId },
  });
  return <MemberPageContent key={clubId} warningEnabled={warningEnabled} />;
}
