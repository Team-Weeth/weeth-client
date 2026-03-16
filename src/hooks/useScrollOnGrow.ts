import { useRef, useEffect } from 'react';

/**
 * count가 증가할 때마다 callback을 호출
 * 리스트에 새 아이템이 추가되었을 때 스크롤을 끝으로 이동
 *
 */
export function useScrollOnGrow(count: number, callback: () => void) {
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      callback();
    }
    prevCount.current = count;
  }, [count, callback]);
}
