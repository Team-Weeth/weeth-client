import { useState, useEffect, useRef } from 'react';

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;

interface UseImageViewerOptions {
  imageCount: number;
  initialIndex: number;
  open: boolean;
}

function useImageViewer({ imageCount, initialIndex, open }: UseImageViewerOptions) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // ref로 최신 값을 동기화하여 이벤트 핸들러에서 stale closure 방지
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const hasMultipleImages = imageCount > 1;

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - ZOOM_STEP, ZOOM_MIN);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleFitScreen = () => {
    resetView();
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
    resetView();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
    resetView();
  };

  const handleThumbnailSelect = (index: number) => {
    setActiveIndex(index);
    resetView();
  };

  const handleOpenChange = (nextOpen: boolean, onOpenChange: (v: boolean) => void) => {
    if (nextOpen) {
      setActiveIndex(initialIndex);
      resetView();
    }
    onOpenChange(nextOpen);
  };

  // 키보드 좌우 이동
  useEffect(() => {
    if (!open || !hasMultipleImages) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
        resetView();
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
        resetView();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasMultipleImages, imageCount]);

  return {
    activeIndex,
    zoom,
    zoomRef,
    setZoom,
    pan,
    panRef,
    setPan,
    hasMultipleImages,
    handleZoomIn,
    handleZoomOut,
    handleFitScreen,
    handlePrev,
    handleNext,
    handleThumbnailSelect,
    handleOpenChange,
  };
}

export { useImageViewer, ZOOM_STEP, ZOOM_MIN, ZOOM_MAX };
