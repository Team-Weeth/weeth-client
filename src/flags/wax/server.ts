import 'server-only';

import { unstable_cache } from 'next/cache';
import { getDevFlagOverrides } from '@/flags/club-features/server';
import { getFeatureFlags } from '@/lib/flagsmith';

/** Flagsmith 기능 이름. 배포 없이 게임을 닫는 운영 스위치다(환경마다 켜고 끈다). */
export const WAX_ENABLED_FLAG = 'wax_enabled';

/**
 * 왁뿌볼을 열지. Flagsmith 장애나 로컬(환경 ID 없음)에서는 열어 둔다. 스위치를 끄는 건 의도한 조작일 때만이어야 한다.
 * Flagsmith에 기능이 아직 없으면 꺼진 것으로 본다. 그래서 환경마다 `wax_enabled`를 만들고 켜야 열린다.
 */
export async function isWaxEnabled() {
  const flags = await getFeatureFlags([WAX_ENABLED_FLAG], {}, true);
  return flags[WAX_ENABLED_FLAG] === true;
}

// 랜딩을 정적 페이지로 유지하려고 게임 운영 스위치 조회 결과를 1분 동안 캐시한다.
const getCachedWaxEnabled = unstable_cache(isWaxEnabled, ['wax-enabled'], { revalidate: 60 });

/**
 * 랜딩처럼 동아리가 없는 화면에서 이벤트 진입점을 보일지. 동아리 화면은 `useClubFeatures().waxEventEnabled`를 쓴다.
 * 게임 운영 스위치(`wax_enabled`)를 그대로 따르므로 게임이 열려 있을 때만 보인다.
 * 덮어쓰기가 허용된 환경(로컬·dev 배포)에서는 개발용 플래그 패널의 값을 따른다. 운영은 쿠키를 읽지 않는다.
 */
export async function isWaxEventEnabled() {
  const override = (await getDevFlagOverrides())[WAX_ENABLED_FLAG];
  if (override !== undefined) return override;
  return getCachedWaxEnabled();
}
