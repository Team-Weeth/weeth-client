'use client';

import { useEffect } from 'react';

function useScrollToTopOnBlur(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    let wasKeyboardOpen = false;

    const handleViewportResize = () => {
      const isKeyboardOpen = viewport.height < window.innerHeight * 0.85;

      if (wasKeyboardOpen && !isKeyboardOpen) {
        const container = containerRef.current;
        const active = document.activeElement;
        const isStillEditing =
          !!container && active instanceof HTMLElement && container.contains(active);

        if (!isStillEditing) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      wasKeyboardOpen = isKeyboardOpen;
    };

    viewport.addEventListener('resize', handleViewportResize);
    return () => viewport.removeEventListener('resize', handleViewportResize);
  }, [containerRef]);
}

export { useScrollToTopOnBlur };
