import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 모바일 일정 리스트에 사용하는 훅.
 * - key가 바뀌면 스크롤을 최상단으로 리셋하고 shadow를 숨긴다.
 * - listRef 요소의 height를 뷰포트 하단까지 채워 페이지 스크롤 대신 리스트만 스크롤되게 한다.
 * - 스크롤이 시작된 경우에만 hasScrolled가 true가 된다 (shadow 표시 조건).
 */
function useScrollableList(key: string) {
  const listRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // key 변경 시 렌더 중 즉시 리셋 (React docs 권장 two-state 패턴)
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setHasScrolled(false);
  }

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const update = () => {
      const top = el.getBoundingClientRect().top;
      el.style.height = `${Math.max(0, window.innerHeight - top)}px`;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [key]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setHasScrolled(e.currentTarget.scrollTop > 0);
  };

  return { listRef, hasScrolled, onScroll };
}

export { useScrollableList };
