'use client';

import { useEffect } from 'react';

function useScrollToTopOnBlur(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const handleFocusOut = (event: FocusEvent) => {
      const container = containerRef.current;
      if (!container || !(event.target instanceof Node) || !container.contains(event.target)) {
        return;
      }

      window.setTimeout(() => {
        const active = document.activeElement;
        const isStillEditing = active instanceof HTMLElement && container.contains(active);

        if (!isStillEditing) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 0);
    };

    document.addEventListener('focusout', handleFocusOut);
    return () => document.removeEventListener('focusout', handleFocusOut);
  }, [containerRef]);
}

export { useScrollToTopOnBlur };
