import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  collapsed: false,
};

export type AdminLNBState = typeof initialState;

export const useAdminLNBStore = create(
  devtools(
    combine(initialState, (set) => ({
      setCollapsed: (collapsed: boolean) => set({ collapsed }, false, 'setCollapsed'),
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed }), false, 'toggleCollapsed'),
    })),
    { name: 'AdminLNBStore' },
  ),
);

export const useAdminLNBCollapsed = () => useAdminLNBStore((store) => store.collapsed);
export const useAdminLNBActions = () =>
  useAdminLNBStore(
    useShallow((store) => ({
      setCollapsed: store.setCollapsed,
      toggleCollapsed: store.toggleCollapsed,
    })),
  );
