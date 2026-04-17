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
 * 그리고 Next.js Link 클릭(anchor capture)을 가로채서 사용자에게 확인을 요청하는 훅.
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

  useEffect(() => {
    if (!enabled) return;

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

    const handleClick = (e: MouseEvent) => {
      if (isLeaving.current) return;
      if (open) return;
      if (e.defaultPrevented) return;
      // 수정 키 또는 비-좌클릭은 브라우저 기본 동작(새 탭/창 등)에 맡김
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      // 외부 링크, 새 탭, 앵커 링크 무시
      if (anchor.target === '_blank') return;
      if (anchor.hasAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const targetUrl = new URL(href, location.origin);
      if (targetUrl.origin !== location.origin) return;
      if (targetUrl.href === guardUrl.current) return;

      // 네비게이션 차단
      e.preventDefault();
      e.stopPropagation();
      pendingUrl.current = targetUrl.href;
      setOpen(true);
    };

    // capture: true — Next.js Link의 onClick보다 먼저 실행
    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled]);

  const onConfirm = () => {
    isLeaving.current = true;
    setOpen(false);

    // location.href 이동 시 beforeunload가 트리거되지 않도록 먼저 제거
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
