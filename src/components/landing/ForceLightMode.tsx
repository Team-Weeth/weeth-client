'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function ForceLightMode() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith('/landing')) return;

    document.documentElement.classList.remove('dark');
  }, [pathname]);

  return null;
}

export { ForceLightMode };
