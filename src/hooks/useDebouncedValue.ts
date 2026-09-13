'use client';

import { useEffect, useState } from 'react';

/**
 * 값이 delay(ms) 동안 안정되면 그 값을 반환한다.
 * 검색어처럼 매 입력마다 바뀌는 값을 요청 파라미터로 넘기기 전 완충한다.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
