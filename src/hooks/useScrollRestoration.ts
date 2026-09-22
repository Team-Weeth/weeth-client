import { useEffect } from 'react';

/**
 * 컴포넌트 언마운트 시 window 스크롤 위치를 sessionStorage에 저장
 * 마운트(데이터 준비) 시 저장된 위치로 복원
 *
 * @param key      저장 키 (null이면 비활성화)
 * @param ready    복원을 시도할 준비가 됐는지 여부 (예: 데이터 로드 완료)
 */
function useScrollRestoration(key: string | null, ready: boolean) {
  // 복원: ready가 true로 바뀌는 시점에 저장된 위치로 이동
  useEffect(() => {
    if (!ready || !key) return;
    const saved = sessionStorage.getItem(`scroll:${key}`);
    if (!saved) return;
    const top = parseInt(saved, 10);
    requestAnimationFrame(() => {
      window.scrollTo({ top, behavior: 'instant' });
    });
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
}

export { useScrollRestoration };
