import { PenaltyPageContent } from '@/components/admin/penalty';
import { isFeatureEnabled } from '@/lib/flagsmith';

export default async function PenaltyPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  const warningEnabled = await isFeatureEnabled('club_warning_enabled', {
    identifier: `club:${clubId}`,
    traits: { club_id: clubId },
  });

  return <PenaltyPageContent key={`${clubId}:${warningEnabled}`} warningEnabled={warningEnabled} />;
}
