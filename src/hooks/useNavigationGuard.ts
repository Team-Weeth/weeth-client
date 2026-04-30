'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseNavigationGuardOptions {
  enabled: boolean;
}

const GUARD_STATE = { __navigationGuard: true } as const;
const NAVIGATION_TIMEOUT = 3000;

function isGuardEntry() {
  return !!(history.state as Record<string, unknown> | null)?.__navigationGuard;
}

/**
 * 브라우저 뒤로가기(popstate), 탭 닫기/새로고침(beforeunload),
 * 그리고 링크 클릭을 가로채서 사용자에게 확인을 요청하는 훅.
 *
 * 반환값의 open / onConfirm / onCancel 을 AlertDialog에 바인딩하여 사용.
 */
function useNavigationGuard({ enabled }: UseNavigationGuardOptions) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const enabledRef = useRef(enabled);
  const isLeaving = useRef(false);
  const guardUrl = useRef('');
  const pendingUrl = useRef<string | null>(null);
  const resetTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasGuardEntry = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // 네비게이션이 실제로 일어나지 않았을 경우 가드를 복원하는 안전장치
  const scheduleGuardReset = (snapshot: string) => {
    if (resetTimerId.current) clearTimeout(resetTimerId.current);
    resetTimerId.current = setTimeout(() => {
      resetTimerId.current = null;
      if (isLeaving.current && location.href === snapshot) {
        isLeaving.current = false;
        guardUrl.current = location.href;
        if (!isGuardEntry()) {
          history.pushState(GUARD_STATE, '', location.href);
          hasGuardEntry.current = true;
        }
      }
    }, NAVIGATION_TIMEOUT);
  };

  // enabled가 true가 될 때 guard entry를 push
  useEffect(() => {
    if (!enabled) {
      hasGuardEntry.current = isGuardEntry();
      return;
    }
    if (isLeaving.current) return;

    guardUrl.current = location.href;
    if (!isGuardEntry()) {
      history.pushState(GUARD_STATE, '', location.href);
    }
    hasGuardEntry.current = true;
  }, [enabled]);

  // 이벤트 리스너는 마운트 시 한 번만 등록하고, ref를 통해 최신 상태를 참조
  useEffect(() => {
    const handlePopState = () => {
      if (isLeaving.current) return;
      if (isGuardEntry()) return;

      if (!enabledRef.current) {
        if (hasGuardEntry.current) {
          hasGuardEntry.current = false;
          history.back();
        }
        return;
      }

      guardUrl.current = location.href;
      setOpen(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!enabledRef.current) return;
      e.preventDefault();
    };

    // <a> 클릭을 캡처 단계에서 가로채서 Next.js Link 내비게이션을 차단
    const handleClick = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      if (isLeaving.current) return;
      // ctrl/cmd/shift 등 새 탭/새 창 클릭은 무시
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor?.href) return;

      // target="_blank" 등 외부 탭은 무시
      if (anchor.target && anchor.target !== '_self') return;

      const targetUrl = new URL(anchor.href);
      if (targetUrl.origin !== location.origin) return;
      if (targetUrl.href === guardUrl.current) return;

      e.preventDefault();
      e.stopPropagation();
      pendingUrl.current = targetUrl.href;
      setOpen(true);
    };

    // capture: true — Next.js Link 핸들러보다 먼저 실행
    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (resetTimerId.current) {
        clearTimeout(resetTimerId.current);
        resetTimerId.current = null;
      }
    };
  }, []);

  const onConfirm = () => {
    isLeaving.current = true;
    hasGuardEntry.current = false;
    setOpen(false);

    const snapshot = location.href;

    if (pendingUrl.current) {
      const target = new URL(pendingUrl.current);
      pendingUrl.current = null;
      router.push(target.pathname + target.search + target.hash);
    } else {
      history.back();
    }

    scheduleGuardReset(snapshot);
  };

  const onCancel = () => {
    pendingUrl.current = null;

    if (isLeaving.current) {
      isLeaving.current = false;
      return;
    }
    setOpen(false);
    // 뒤로가기로 guard entry를 벗어난 경우에만 재설정
    if (!isGuardEntry()) {
      history.pushState(GUARD_STATE, '', guardUrl.current);
      hasGuardEntry.current = true;
    }
  };

  const allowNavigation = () => {
    isLeaving.current = true;
    hasGuardEntry.current = false;
    pendingUrl.current = null;
    scheduleGuardReset(location.href);
  };

  return { open, onConfirm, onCancel, allowNavigation };
}

export { useNavigationGuard };
