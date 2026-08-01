import { useEffect, useMemo, useState } from 'react';

interface UseBottomSheetSnapPointsParams {
  expandable: boolean;
  initialSnapHeight: number;
  topGap: number;
  snapPoints?: (number | string)[];
}

function useBottomSheetSnapPoints({
  expandable,
  initialSnapHeight,
  topGap,
  snapPoints,
}: UseBottomSheetSnapPointsParams) {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.visualViewport?.height ?? window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('resize', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  const resolvedSnapPoints = useMemo(() => {
    if (snapPoints) return snapPoints;
    if (!expandable || !viewportHeight) return undefined;

    const maxSnapHeight = Math.max(viewportHeight - topGap, 0);
    const initialHeight = Math.min(initialSnapHeight, maxSnapHeight);

    return [`${initialHeight}px`, `${maxSnapHeight}px`];
  }, [expandable, initialSnapHeight, snapPoints, topGap, viewportHeight]);

  return {
    resolvedSnapPoints,
    hasSnapPoints: Boolean(resolvedSnapPoints?.length),
  };
}

export { useBottomSheetSnapPoints };
