import { useRef, useCallback, useEffect } from 'react';

const DRAG_THRESHOLD = 5;

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const wasDraggingRef = useRef(false);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const startX = e.pageX - el.offsetLeft;
    const startPageX = e.pageX;
    const scrollLeft = el.scrollLeft;

    const handleMouseMove = (ev: MouseEvent) => {
      ev.preventDefault();
      if (Math.abs(ev.pageX - startPageX) > DRAG_THRESHOLD) {
        wasDraggingRef.current = true;
      }
      el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX);
    };

    const cleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', cleanup);
      cleanupRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', cleanup);
    cleanupRef.current = cleanup;
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      e.stopPropagation();
    }
  }, []);

  const SCROLL_STEP = 200;

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const el = ref.current;
    if (!el) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      el.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
    }
  }, []);

  const scrollToEnd = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const images = el.querySelectorAll<HTMLImageElement>('img');
    const lastImg = images[images.length - 1];

    const doScroll = () => el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });

    if (lastImg && !lastImg.complete) {
      lastImg.addEventListener('load', doScroll, { once: true });
      lastImg.addEventListener('error', doScroll, { once: true });
    } else {
      requestAnimationFrame(doScroll);
    }
  }, []);

  return {
    ref,
    onMouseDown,
    onKeyDown,
    onClickCapture,
    scrollToEnd,
  };
}
