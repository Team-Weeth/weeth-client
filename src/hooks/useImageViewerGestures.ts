import { useEffect, useRef } from 'react';
import { ZOOM_STEP, ZOOM_MIN, ZOOM_MAX } from '@/hooks/useImageViewer';

// 마우스 휠 줌
function useWheelZoom(
  imageAreaRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
  setZoom: React.Dispatch<React.SetStateAction<number>>,
) {
  useEffect(() => {
    if (!open) return;

    let el: HTMLDivElement | null = null;
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      setZoom((prev) => {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        return Math.min(Math.max(prev + delta, ZOOM_MIN), ZOOM_MAX);
      });
    }

    // Radix Portal이 DOM에 마운트된 뒤 이벤트 등록
    const raf = requestAnimationFrame(() => {
      el = imageAreaRef.current;
      if (el) el.addEventListener('wheel', handleWheel, { passive: false });
    });

    return () => {
      cancelAnimationFrame(raf);
      if (el) el.removeEventListener('wheel', handleWheel);
    };
  }, [open, imageAreaRef, setZoom]);
}

// 드래그 패닝 (zoom > 1일 때만)
function useDragPan(
  imageAreaRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
  zoomRef: React.RefObject<number>,
  panRef: React.RefObject<{ x: number; y: number }>,
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
) {
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;

    let el: HTMLDivElement | null = null;

    function handlePointerDown(e: PointerEvent) {
      if (e.button !== 0 || zoomRef.current <= 1) return;
      if ((e.target as HTMLElement).closest('button, a, [role="button"]')) return;
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      panStart.current = { ...panRef.current };
      el?.setPointerCapture(e.pointerId);
      if (el) el.style.cursor = 'grabbing';
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
    }

    function handlePointerUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (el) el.style.cursor = '';
    }

    const raf = requestAnimationFrame(() => {
      el = imageAreaRef.current;
      if (!el) return;
      el.addEventListener('pointerdown', handlePointerDown);
      el.addEventListener('pointermove', handlePointerMove);
      el.addEventListener('pointerup', handlePointerUp);
      el.addEventListener('pointercancel', handlePointerUp);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (!el) return;
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [open, imageAreaRef, zoomRef, panRef, setPan]);
}

// 터치 스와이프 (zoom === 1일 때 좌우 이동) + 핀치 줌
function useTouchGestures(
  imageAreaRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
  zoomRef: React.RefObject<number>,
  setZoom: React.Dispatch<React.SetStateAction<number>>,
  onPrev: () => void,
  onNext: () => void,
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const initialPinchZoom = useRef(1);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onPrevRef.current = onPrev;
    onNextRef.current = onNext;
  }, [onPrev, onNext]);

  useEffect(() => {
    if (!open) return;

    let el: HTMLDivElement | null = null;

    function getDistance(t1: Touch, t2: Touch) {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 1 && zoomRef.current <= 1) {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        e.preventDefault();
        initialPinchDistance.current = getDistance(e.touches[0], e.touches[1]);
        initialPinchZoom.current = zoomRef.current;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && initialPinchDistance.current !== null) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialPinchDistance.current;
        setZoom(Math.min(Math.max(initialPinchZoom.current * scale, ZOOM_MIN), ZOOM_MAX));
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      if (initialPinchDistance.current !== null) {
        initialPinchDistance.current = null;
        return;
      }

      if (touchStart.current && e.changedTouches.length === 1 && zoomRef.current <= 1) {
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        const SWIPE_THRESHOLD = 50;

        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) onPrevRef.current();
          else onNextRef.current();
        }
      }
      touchStart.current = null;
    }

    const raf = requestAnimationFrame(() => {
      el = imageAreaRef.current;
      if (!el) return;
      el.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.addEventListener('touchmove', handleTouchMove, { passive: false });
      el.addEventListener('touchend', handleTouchEnd);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (!el) return;
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [open, imageAreaRef, zoomRef, setZoom]);
}

// 인접 이미지 프리로드
function usePreloadImages(images: { url: string }[], activeIndex: number, open: boolean) {
  useEffect(() => {
    if (!open || images.length <= 1) return;

    const toPreload = [images[activeIndex - 1]?.url, images[activeIndex + 1]?.url].filter(
      Boolean,
    ) as string[];

    toPreload.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [open, activeIndex, images]);
}

// 썸네일 자동 스크롤
function useThumbnailScroll(
  thumbnailRef: React.RefObject<HTMLDivElement | null>,
  activeIndex: number,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || !thumbnailRef.current) return;
    const container = thumbnailRef.current;
    const active = container.children[activeIndex] as HTMLElement | undefined;
    if (!active) return;
    const left = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
    container.scrollTo({ left, behavior: 'smooth' });
  }, [activeIndex, enabled, thumbnailRef]);
}

export { useWheelZoom, useDragPan, useTouchGestures, usePreloadImages, useThumbnailScroll };
