import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types/theme';

interface ThemeStore {
  mode: ThemeMode;
  isDark: boolean;
  hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  setDark: (isDark: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedStateV0 = { isDark?: boolean };

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'auto',
      isDark: false,
      hasHydrated: false,
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
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'weeth-theme',
      version: 1,
      partialize: (state) => ({ mode: state.mode, isDark: state.isDark }),
      migrate: (persistedState, version) => {
        if (version === 0) {
          const old = persistedState as PersistedStateV0;
          const mode: ThemeMode =
            old.isDark === true ? 'dark' : old.isDark === false ? 'light' : 'auto';
          return { mode, isDark: old.isDark ?? false };
        }
        return persistedState as ThemeStore;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        } else {
          useThemeStore.setState({ hasHydrated: true });
        }
      },
    },
  ),
);
