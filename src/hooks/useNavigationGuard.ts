'use client';

import { useEffect, useRef, useState } from 'react';

interface UseNavigationGuardOptions {
  enabled: boolean;
}

const GUARD_STATE = { __navigationGuard: true } as const;

function isGuardEntry() {
  return !!(history.state as Record<string, unknown> | null)?.__navigationGuard;
}

/**
 * 브라우저 뒤로가기(popstate) 및 탭 닫기/새로고침(beforeunload)을
 * 가로채서 사용자에게 확인을 요청하는 훅.
 *
 * 반환값의 open / onConfirm / onCancel 을 AlertDialog에 바인딩하여 사용.
 */
function useNavigationGuard({ enabled }: UseNavigationGuardOptions) {
  const [open, setOpen] = useState(false);
  const isLeaving = useRef(false);
  const guardUrl = useRef('');

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

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled]);

  const onConfirm = () => {
    isLeaving.current = true;
    setOpen(false);
    history.back();
  };

  const onCancel = () => {
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
