'use client';

import { useSyncExternalStore } from 'react';

/**
 * CSS 미디어 쿼리의 매치 여부를 구독한다.
 * SSR 시에는 항상 false를 반환하고, 마운트 후 실제 값으로 동기화되어 하이드레이션 불일치를 피한다.
 */
function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  };

  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export { useMediaQuery };
