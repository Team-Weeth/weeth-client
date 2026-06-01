import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  isEditMode: false,
};

export type AdminHeaderState = typeof initialState;

export const useAdminHeaderStore = create(
  devtools(
    combine(initialState, (set) => ({
      setEditMode: (isEditMode: boolean) => set({ isEditMode }, false, 'setEditMode'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'AdminHeaderStore' },
  ),
);

export const useIsAdminEditMode = () => useAdminHeaderStore((store) => store.isEditMode);
export const useSetAdminEditMode = () => useAdminHeaderStore((store) => store.setEditMode);
