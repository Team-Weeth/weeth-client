import { useState, useEffect } from 'react';
import type { RefObject } from 'react';
import type { GroupImage } from '@/components/board/Editor/extensions/ImageGroup/ImageGroup';
import { DROP_ZONE_WIDTH, READ_ONLY_GAP } from '@/utils/board/imageGroupUtils';

type Dim = { w: number; h: number };

interface UseJustifiedLayoutResult {
  targetH: number | null;
  cellWidths: number[] | null;
  handleImageDimLoad: (src: string, e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * 이미지 자연 크기를 수집하고 컨테이너 너비를 추적하여
 * justified layout 의 targetH 와 cellWidths 를 반환한다.
 */
export function useJustifiedLayout(
  images: GroupImage[],
  isEditable: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
): UseJustifiedLayoutResult {
  // src → 자연 크기 캐시 (이미지 재정렬 시에도 재측정 불필요)
  const [dimsBySrc, setDimsBySrc] = useState<Record<string, Dim>>({});
  const [containerWidth, setContainerWidth] = useState(0);

  // 컨테이너 너비 추적
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  const handleImageDimLoad = (src: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setDimsBySrc((prev) => {
        if (prev[src]) return prev;
        return { ...prev, [src]: { w: img.naturalWidth, h: img.naturalHeight } };
      });
    }
  };

  // Justified layout 계산
  // 편집 모드: DropZoneLine(12px) × (N+1)개가 공간을 차지함
  // 읽기 전용: gap-200(8px) × (N-1)개가 공간을 차지함
  const dropZoneOverhead = isEditable
    ? DROP_ZONE_WIDTH * (images.length + 1)
    : READ_ONLY_GAP * Math.max(0, images.length - 1);
  const allDimsLoaded = containerWidth > 0 && images.every((img) => dimsBySrc[img.src]);

  let targetH: number | null = null;
  let cellWidths: number[] | null = null;

  if (allDimsLoaded && images.length > 0) {
    const aspectSum = images.reduce((sum, img) => {
      const d = dimsBySrc[img.src]!;
      return sum + d.w / d.h;
    }, 0);
    targetH = (containerWidth - dropZoneOverhead) / aspectSum;
    // 각 flex-wrapper 너비 = 이미지 너비 + (편집 모드면 내부 DropZone 너비 포함)
    cellWidths = images.map((img) => {
      const d = dimsBySrc[img.src]!;
      return targetH! * (d.w / d.h) + (isEditable ? DROP_ZONE_WIDTH : 0);
    });
  }

  return { targetH, cellWidths, handleImageDimLoad };
}
