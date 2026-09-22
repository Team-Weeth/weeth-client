import { useEffect, useLayoutEffect, useState } from 'react';

// SSR에서 useLayoutEffect 경고를 피하기 위한 isomorphic 버전
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * 컴포넌트 언마운트 시 window 스크롤 위치를 sessionStorage에 저장하고,
 * 마운트(데이터 준비) 시 저장된 목표 위치를 반환합니다.
 *
 * 무한 스크롤처럼 문서 높이가 점진적으로 늘어나는 경우,
 * 호출 측에서 pendingTarget을 보고 높이가 충분해질 때까지
 * 다음 페이지를 fetch한 뒤 window.scrollTo를 호출하세요.
 * 복원 완료 후 clearPendingTarget()을 호출해 상태를 초기화하세요.
 *
 * @param key      저장 키 (null이면 비활성화)
 * @param ready    복원을 시도할 준비가 됐는지 여부 (예: 데이터 로드 완료)
 */
function useScrollRestoration(key: string | null, ready: boolean) {
  const [pendingTarget, setPendingTarget] = useState<number | null>(null);

  // 복원: ready가 true로 바뀌는 시점에 저장된 위치를 pendingTarget으로 설정
  useIsomorphicLayoutEffect(() => {
    if (!ready || !key) return;
    const saved = sessionStorage.getItem(`scroll:${key}`);
    if (!saved) return;
    const top = parseInt(saved, 10);
    if (top > 0) setPendingTarget(top);
  }, [ready, key]);

  // 저장: 언마운트 시 현재 스크롤 위치 기록
  useEffect(() => {
    if (!key) return;
    return () => {
      const top = window.scrollY;
      if (top > 0) {
        sessionStorage.setItem(`scroll:${key}`, String(top));
      } else {
        sessionStorage.removeItem(`scroll:${key}`);
      }
    };
  }, [key]);

  const clearPendingTarget = () => setPendingTarget(null);

  return { pendingTarget, clearPendingTarget };
}

export { useScrollRestoration };
