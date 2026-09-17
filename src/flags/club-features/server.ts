import 'server-only';

import { cache } from 'react';
import { getFeatureFlags } from '@/lib/flagsmith';
import { CLUB_FEATURE_FLAGS, type ClubFeatures } from './definitions';

// 같은 서버 렌더링 내에서 동아리별 조회를 공유한다.
export const getClubFeatures = cache(async (clubId: string): Promise<ClubFeatures> => {
  const flags = await getFeatureFlags(Object.values(CLUB_FEATURE_FLAGS), {
    identifier: `club:${clubId}`,
    traits: { club_id: clubId },
  });
  return { warningEnabled: flags[CLUB_FEATURE_FLAGS.warningEnabled] === true };
});
