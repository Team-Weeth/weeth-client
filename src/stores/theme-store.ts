import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'auto',
      isDark: false,
      setMode: (mode) => {
        if (mode === 'light') {
          set({ mode, isDark: false });
        } else if (mode === 'dark') {
          set({ mode, isDark: true });
        } else {
          const prefersDark =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;
          set({ mode, isDark: prefersDark });
        }
      },
      setDark: (isDark) => set({ isDark }),
    }),
    { name: 'weeth-theme' },
  ),
);
