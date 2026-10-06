import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

interface UseSubSelectionResult {
  subSelectedIdx: number | null;
  setSubSelectedIdx: (idx: number | null) => void;
  handleDoubleClick: (e: React.MouseEvent, idx: number) => void;
  handleContainerClick: (e: React.MouseEvent) => void;
}

/**
 * imageGroup 내 개별 이미지의 서브 선택 상태를 관리한다.
 * 더블클릭으로 선택, 컨테이너 바깥 클릭으로 해제.
 */
export function useSubSelection(
  isEditable: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
): UseSubSelectionResult {
  const [subSelectedIdx, setSubSelectedIdx] = useState<number | null>(null);

  // 서브 선택 중 컨테이너 바깥 클릭 시 선택 해제
  useEffect(() => {
    if (subSelectedIdx === null) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSubSelectedIdx(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [subSelectedIdx, containerRef]);

  const handleDoubleClick = (e: React.MouseEvent, idx: number) => {
    if (!isEditable) return;
    e.stopPropagation();
    setSubSelectedIdx(idx);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-group-image]')) return;
    setSubSelectedIdx(null);
  };

  return { subSelectedIdx, setSubSelectedIdx, handleDoubleClick, handleContainerClick };
}
