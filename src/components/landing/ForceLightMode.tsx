'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/stores/theme-store';

const STORAGE_KEY = 'weeth-theme-before-landing';

function ForceLightMode() {
  const pathname = usePathname();
  const setDark = useThemeStore((state) => state.setDark);

  useEffect(() => {
    const isLanding = pathname.startsWith('/landing');

    if (isLanding) {
      const { isDark } = useThemeStore.getState();
      if (isDark) {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setDark(false);
      }
    } else {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved === 'true') {
        sessionStorage.removeItem(STORAGE_KEY);
        setDark(true);
      }
    }
  }, [pathname, setDark]);

  return null;
}

export { ForceLightMode };
