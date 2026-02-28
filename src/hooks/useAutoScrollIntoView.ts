import { useRef, useEffect } from 'react';

/**
 * selectedIndex 변경 시 해당 인덱스를 가진 요소를 스크롤 컨테이너 내에서 자동으로 보이도록 스크롤
 *
 * @param selectedIndex - 현재 선택된 아이템의 인덱스
 * @returns containerRef - 스크롤 컨테이너 요소에 붙일 ref
 */

export function useAutoScrollIntoView<T extends HTMLElement>(selectedIndex: number) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectedEl = container.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return containerRef;
}
