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
  // zoom과 pan을 하나의 state로 관리해 항상 원자적으로 업데이트
  const [view, setView] = useState({ zoom: 1, pan: { x: 0, y: 0 } });

  const { zoom, pan } = view;

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
    setView({ zoom: 1, pan: { x: 0, y: 0 } });
  };

  // zoom이 1 이하가 되면 pan을 함께 초기화 — 순수 업데이터이므로 재실행에 안전
  const setZoom = (updater: number | ((prev: number) => number)) => {
    setView((prev) => {
      const next = typeof updater === 'function' ? updater(prev.zoom) : updater;
      return { zoom: next, pan: next <= 1 ? { x: 0, y: 0 } : prev.pan };
    });
  };

  const setPan = (
    updater:
      | { x: number; y: number }
      | ((prev: { x: number; y: number }) => { x: number; y: number }),
  ) => {
    setView((prev) => {
      const next = typeof updater === 'function' ? updater(prev.pan) : updater;
      return { ...prev, pan: next };
    });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN));
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
