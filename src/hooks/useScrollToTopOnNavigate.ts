'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function useScrollToTopOnNavigate() {
  const pathname = usePathname();
  const isPopState = useRef(false);
  const pathnameRef = useRef(pathname);

  useLayoutEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      if (window.location.pathname !== pathnameRef.current) {
        isPopState.current = true;
      }
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
