import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { getFeatureFlags } from '@/lib/flagsmith';
import { CLUB_FEATURE_FLAGS, USER_SCOPED_FLAGS, type ClubFeatures } from './definitions';
import {
  DEV_FLAG_OVERRIDE_COOKIE,
  isDevFlagOverrideEnabled,
  parseDevFlagOverrides,
  type DevFlagOverrides,
} from './dev-overrides';

/** 개발용 쿠키에 저장된 덮어쓰기 값. 덮어쓰기가 꺼진 환경에서는 항상 비어 있다. */
export async function getDevFlagOverrides(): Promise<DevFlagOverrides> {
  if (!isDevFlagOverrideEnabled()) return {};

  const cookieStore = await cookies();
  return parseDevFlagOverrides(cookieStore.get(DEV_FLAG_OVERRIDE_COOKIE)?.value);
}

const userScopedFlagKeys = new Set<string>(USER_SCOPED_FLAGS.map((k) => CLUB_FEATURE_FLAGS[k]));

/** 동아리 identity로 조회할 플래그 키 */
const clubFlagKeys = Object.values(CLUB_FEATURE_FLAGS).filter((k) => !userScopedFlagKeys.has(k));
/** 유저 identity로 조회할 플래그 키 */
const userFlagKeys = Object.values(CLUB_FEATURE_FLAGS).filter((k) => userScopedFlagKeys.has(k));

// 같은 서버 렌더링 내에서 동아리+유저별 조회를 공유한다.
export const getClubFeatures = cache(
  async (clubId: string, userId?: string): Promise<ClubFeatures> => {
    const [clubFlags, userFlags, overrides] = await Promise.all([
      getFeatureFlags(clubFlagKeys, {
        identifier: `club:${clubId}`,
        traits: { club_id: clubId },
      }),
      userId && userFlagKeys.length > 0
        ? getFeatureFlags(userFlagKeys, { identifier: `user:${userId}` })
        : Promise.resolve<Record<string, boolean>>({}),
      getDevFlagOverrides(),
    ]);
    const resolved = { ...clubFlags, ...userFlags, ...overrides };

    return Object.fromEntries(
      Object.entries(CLUB_FEATURE_FLAGS).map(([key, flagKey]) => [key, resolved[flagKey] === true]),
    ) as ClubFeatures;
  },
);
