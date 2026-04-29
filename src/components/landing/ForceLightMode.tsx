'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/stores/theme-store';

function ForceLightMode() {
  const pathname = usePathname();
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    const isLanding = pathname.startsWith('/landing');

    if (isLanding) {
      document.documentElement.classList.remove('dark');
      return;
    }

    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark, pathname]);

  return null;
}

export { ForceLightMode };
