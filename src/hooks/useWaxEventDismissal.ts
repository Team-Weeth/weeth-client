'use client';

import { useSyncExternalStore } from 'react';
import { WAX_EVENT_POPUP_HIDE_HOURS, WAX_EVENT_STORAGE_KEYS } from '@/constants/waxEvent';

// 같은 탭에서 바꾼 값은 storage 이벤트가 오지 않으므로 직접 알린다.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // 저장소를 쓸 수 없으면 이번 화면에서만 닫힌다.
  }
  listeners.forEach((listener) => listener());
}

/**
 * 상단 띠배너를 닫았는지. 서버 렌더에서는 열린 것으로 그려서, 닫은 적 없는 대부분의 사용자에게
 * 하이드레이션 뒤 레이아웃이 밀리지 않게 한다.
 */
function useWaxEventBannerClosed() {
  const closed = useSyncExternalStore(
    subscribe,
    () => readStorage(WAX_EVENT_STORAGE_KEYS.bannerClosed) === 'true',
    () => false,
  );
  const close = () => writeStorage(WAX_EVENT_STORAGE_KEYS.bannerClosed, 'true');
  return { closed, close };
}

/** 홈 팝업을 "24시간동안 보이지 않기"로 숨겨 둔 상태인지. 서버 렌더에서는 숨긴 것으로 본다. */
function useWaxEventPopupHidden() {
  const hidden = useSyncExternalStore(
    subscribe,
    () => {
      const hideUntil = readStorage(WAX_EVENT_STORAGE_KEYS.popupHideUntil);
      return hideUntil !== null && Date.now() < new Date(hideUntil).getTime();
    },
    () => true,
  );
  const hideForHours = () => {
    const hideUntil = new Date(Date.now() + WAX_EVENT_POPUP_HIDE_HOURS * 60 * 60 * 1000);
    writeStorage(WAX_EVENT_STORAGE_KEYS.popupHideUntil, hideUntil.toISOString());
  };
  return { hidden, hideForHours };
}

export { useWaxEventBannerClosed, useWaxEventPopupHidden };
