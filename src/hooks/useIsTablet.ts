import { useState, useEffect } from 'react';

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 696px)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 696px)');
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isTablet;
}

export { useIsTablet };
