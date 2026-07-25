'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function useScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    const id = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(id);
  }, [pathname]);
}

export { useScrollToTopOnNavigate };
