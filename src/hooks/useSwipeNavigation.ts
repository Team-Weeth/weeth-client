import { useEffect, useRef, useState } from 'react';

const SWIPE_THRESHOLD = 50;

interface UseSwipeNavigationProps {
  onPrev: () => void;
  onNext: () => void;
}

function useSwipeNavigation({ onPrev, onNext }: UseSwipeNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontal = useRef<boolean | null>(null);
  const pendingNav = useRef<'prev' | 'next' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontal.current = null;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const deltaX = e.touches[0].clientX - touchStartX.current;
      const deltaY = e.touches[0].clientY - touchStartY.current;

      // Determine swipe direction on first movement
      if (isHorizontal.current === null) {
        isHorizontal.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      if (isHorizontal.current) {
        e.preventDefault(); // block vertical scroll during horizontal swipe
        setDragX(deltaX);
      }
    };

    container.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => container.removeEventListener('touchmove', onTouchMove);
  }, []);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !isHorizontal.current) {
      touchStartX.current = null;
      touchStartY.current = null;
      isHorizontal.current = null;
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontal.current = null;

    const containerWidth = containerRef.current?.offsetWidth ?? 375;

    if (deltaX > SWIPE_THRESHOLD) {
      pendingNav.current = 'prev';
      setIsTransitioning(true);
      setDragX(containerWidth);
    } else if (deltaX < -SWIPE_THRESHOLD) {
      pendingNav.current = 'next';
      setIsTransitioning(true);
      setDragX(-containerWidth);
    } else if (dragX !== 0) {
      // Below threshold — snap back to center
      setIsTransitioning(true);
      setDragX(0);
    }
  };

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    // Ignore bubbled transition-colors events from child date spans
    if (e.propertyName !== 'transform') return;
    if (pendingNav.current === 'prev') onPrev();
    else if (pendingNav.current === 'next') onNext();
    pendingNav.current = null;
    setIsTransitioning(false);
    setDragX(0);
  };

  return {
    containerRef,
    dragX,
    isTransitioning,
    handleTouchStart,
    handleTouchEnd,
    handleTransitionEnd,
  };
}

export { useSwipeNavigation };
