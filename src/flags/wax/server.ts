import 'server-only';

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
