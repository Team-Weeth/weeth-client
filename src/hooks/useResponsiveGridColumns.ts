'use client';

import { useEffect, useRef, useState } from 'react';

interface UseResponsiveGridColumnsOptions {
  itemCount: number;
  minColumnWidth: number;
  gap: number;
}

function useResponsiveGridColumns({
  itemCount,
  minColumnWidth,
  gap,
}: UseResponsiveGridColumnsOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measureColumnCount = () => {
      const containerWidth = element.clientWidth;
      const nextColumnCount = Math.max(
        1,
        Math.min(itemCount, Math.floor((containerWidth + gap) / (minColumnWidth + gap))),
      );

      setColumnCount(nextColumnCount);
    };

    measureColumnCount();

    const resizeObserver = new ResizeObserver(measureColumnCount);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [gap, itemCount, minColumnWidth]);

  return {
    containerRef,
    columnCount,
    isSingleColumn: columnCount <= 1,
  };
}

export { useResponsiveGridColumns, type UseResponsiveGridColumnsOptions };
