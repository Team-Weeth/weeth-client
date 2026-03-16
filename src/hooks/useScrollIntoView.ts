import { useRef, useEffect } from 'react';

/**
 * 조건이 true로 바뀔 때 대상 요소를 화면에 보이도록 스크롤
 *
 * @param active - true일 때 스크롤 실행
 */
export function useScrollIntoView<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  return ref;
}
