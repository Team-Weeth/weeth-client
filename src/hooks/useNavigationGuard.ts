'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseNavigationGuardOptions {
  enabled: boolean;
}

const GUARD_STATE = { __navigationGuard: true } as const;

function isGuardEntry() {
  return !!(history.state as Record<string, unknown> | null)?.__navigationGuard;
}

/**
 * 브라우저 뒤로가기(popstate), 탭 닫기/새로고침(beforeunload),
 * 그리고 링크 클릭·프로그래매틱 네비게이션(router.push 등)을 가로채서 사용자에게 확인을 요청하는 훅.
 *
 * 반환값의 open / onConfirm / onCancel 을 AlertDialog에 바인딩하여 사용.
 */
function useNavigationGuard({ enabled }: UseNavigationGuardOptions) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isLeaving = useRef(false);
  const guardUrl = useRef('');
  const pendingUrl = useRef<string | null>(null);
  const beforeUnloadRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);

  // guardUrl을 현재 URL과 동기화 — 같은 페이지 내 쿼리 파라미터 변경 등 반영
  useEffect(() => {
    if (!enabled) return;

    const syncGuardUrl = () => {
      guardUrl.current = location.href;
    };

    window.addEventListener('popstate', syncGuardUrl);
    return () => window.removeEventListener('popstate', syncGuardUrl);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      // enabled가 꺼질 때 guard entry 정리
      if (isGuardEntry()) {
        history.back();
      }
      return;
    }

    isLeaving.current = false;
    guardUrl.current = location.href;

    if (!isGuardEntry()) {
      history.pushState(GUARD_STATE, '', location.href);
    }

    const handlePopState = () => {
      if (isLeaving.current) return;
      setOpen(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    beforeUnloadRef.current = handleBeforeUnload;

    // <a> 클릭을 캡처 단계에서 가로채서 Next.js Link 내비게이션을 차단
    const handleClick = (e: MouseEvent) => {
      if (isLeaving.current) return;
      // ctrl/cmd/shift 등 새 탭/새 창 클릭은 무시
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      // anchor.href는 브라우저가 이미 절대 URL로 변환한 값
      if (!anchor.href) return;

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

    // pushState/replaceState 패치 — router.push() 등 프로그래매틱 내비게이션 감지
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    const interceptNavigation = (
      original: typeof history.pushState,
      ...args: Parameters<typeof history.pushState>
    ) => {
      if (isLeaving.current) {
        original(...args);
        return;
      }

      const url = args[2];
      if (!url) {
        original(...args);
        return;
      }

      const targetUrl = new URL(String(url), location.href);
      if (targetUrl.origin !== location.origin || targetUrl.href === guardUrl.current) {
        original(...args);
        return;
      }

      pendingUrl.current = targetUrl.href;
      setOpen(true);
    };

    history.pushState = (...args) => interceptNavigation(originalPushState, ...args);
    history.replaceState = (...args) => interceptNavigation(originalReplaceState, ...args);

    // capture: true — Next.js Link 핸들러보다 먼저 실행
    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled]);

  const onConfirm = () => {
    isLeaving.current = true;
    setOpen(false);

    if (beforeUnloadRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadRef.current);
      beforeUnloadRef.current = null;
    }

    if (pendingUrl.current) {
      const target = new URL(pendingUrl.current);
      pendingUrl.current = null;
      router.push(target.pathname + target.search + target.hash);
    } else {
      history.back();
    }
  };

  const onCancel = () => {
    pendingUrl.current = null;

    if (isLeaving.current) {
      isLeaving.current = false;
      return;
    }
    setOpen(false);
    history.pushState(GUARD_STATE, '', guardUrl.current);
  };

  return { open, onConfirm, onCancel };
}

export { useNavigationGuard };
