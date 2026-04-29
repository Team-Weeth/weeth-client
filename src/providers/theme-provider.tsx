'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDark = useThemeStore((state) => state.isDark);
  const mode = useThemeStore((state) => state.mode);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);
  const setDark = useThemeStore((state) => state.setDark);
  const forceLight = pathname.startsWith('/landing');

  useEffect(() => {
    if (forceLight) {
      document.documentElement.classList.remove('dark');
      return;
    }

    if (!hasHydrated) return;

    document.documentElement.classList.toggle('dark', isDark);
  }, [forceLight, hasHydrated, isDark]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (mode !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [hasHydrated, mode, setDark]);

  return <>{children}</>;
}
