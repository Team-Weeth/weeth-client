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
 * 그리고 링크 클릭을 가로채서 사용자에게 확인을 요청하는 훅.
 *
 * 반환값의 open / onConfirm / onCancel 을 AlertDialog에 바인딩하여 사용.
 */
function useNavigationGuard({ enabled }: UseNavigationGuardOptions) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isLeaving = useRef(false);
  const guardUrl = useRef('');
  const pendingUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (isGuardEntry() && !isLeaving.current) {
        history.back();
      }
      return;
    }

    // allowNavigation()으로 이탈이 허용된 상태라면 guard를 재설정하지 않음
    if (isLeaving.current) return;

    guardUrl.current = location.href;

    if (!isGuardEntry()) {
      history.pushState(GUARD_STATE, '', location.href);
    }

    const handlePopState = () => {
      if (isLeaving.current) return;
      guardUrl.current = location.href;
      setOpen(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    // <a> 클릭을 캡처 단계에서 가로채서 Next.js Link 내비게이션을 차단
    const handleClick = (e: MouseEvent) => {
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
    };
  }, [enabled]);

  const onConfirm = () => {
    isLeaving.current = true;
    setOpen(false);

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

  const allowNavigation = () => {
    isLeaving.current = true;
    pendingUrl.current = null;
  };

  return { open, onConfirm, onCancel, allowNavigation };
}

export { useNavigationGuard };
