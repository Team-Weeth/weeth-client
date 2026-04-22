import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'auto' | 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setDark: (isDark: boolean) => void;
}

type PersistedStateV0 = { isDark?: boolean };

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
    {
      name: 'weeth-theme',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          const old = persistedState as PersistedStateV0;
          const mode: ThemeMode =
            old.isDark === true ? 'dark' : old.isDark === false ? 'light' : 'auto';
          return { mode, isDark: old.isDark ?? false };
        }
        return persistedState as ThemeStore;
      },
    },
  ),
);
