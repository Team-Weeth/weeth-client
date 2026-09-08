import { useRef, useState } from 'react';

const SWIPE_THRESHOLD = 50;

interface UseSwipeNavigationProps {
  onPrev: () => void;
  onNext: () => void;
}

function useSwipeNavigation({ onPrev, onNext }: UseSwipeNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const pendingNav = useRef<'prev' | 'next' | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    setDragX(e.touches[0].clientX - touchStartX.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

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
    handleTouchMove,
    handleTouchEnd,
    handleTransitionEnd,
  };
}

export { useSwipeNavigation };
