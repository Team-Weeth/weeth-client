'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';

// Tailwind `max-tablet:`과 같은 범위 — `--breakpoint-tablet`(696px) 미만이다.
const MOBILE_QUERY = '(max-width: 695.98px)';

/**
 * 화면 폭이 tablet 브레이크포인트 미만인지 구독한다.
 * 브레이크포인트를 바꿀 때 이 쿼리만 고치면 되도록 컴포넌트에서 직접 쿼리를 쓰지 않는다.
 */
function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}

export { useIsMobile };
