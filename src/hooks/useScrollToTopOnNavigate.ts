'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function useScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
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
