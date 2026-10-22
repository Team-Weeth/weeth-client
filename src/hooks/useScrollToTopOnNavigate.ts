'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function useScrollToTopOnNavigate() {
  const pathname = usePathname();
  const isPopState = useRef(false);

  useEffect(() => {
    const handler = () => {
      isPopState.current = true;
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    if (isPopState.current) {
      isPopState.current = false;
      return;
    }

    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => window.scrollTo(0, 0));
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [pathname]);
}

export { useScrollToTopOnNavigate };
