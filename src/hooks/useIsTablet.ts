import { useSyncExternalStore } from 'react';

const TABLET_QUERY = '(min-width: 696px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(TABLET_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  return window.matchMedia(TABLET_QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function useIsTablet() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export { useIsTablet };
