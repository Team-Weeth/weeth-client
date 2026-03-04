import { useRef, useCallback } from 'react';

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    state.current = { isDown: true, startX: e.pageX, scrollLeft: el.scrollLeft };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.current.isDown) return;
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = state.current.scrollLeft - (e.pageX - state.current.startX);
  }, []);

  const onMouseUp = useCallback(() => {
    state.current.isDown = false;
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
    } else {
      requestAnimationFrame(doScroll);
    }
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave: onMouseUp,
    onKeyDown,
    scrollToEnd,
  };
}
