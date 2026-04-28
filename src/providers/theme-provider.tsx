'use client';

import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = useThemeStore((state) => state.isDark);
  const mode = useThemeStore((state) => state.mode);
  const setDark = useThemeStore((state) => state.setDark);
  const setMode = useThemeStore((state) => state.setMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (
      (mode === 'light' && isDark && prefersDark) ||
      (mode === 'dark' && !isDark && !prefersDark)
    ) {
      setMode('auto');
    }
  }, [isDark, mode, setMode]);

  useEffect(() => {
    if (mode !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, setDark]);

  return <>{children}</>;
}
