import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: true,
      toggle: () => set((state) => ({ isDark: !state.isDark })),
      setDark: (isDark) => set({ isDark }),
    }),
    { name: 'weeth-theme' },
  ),
);
