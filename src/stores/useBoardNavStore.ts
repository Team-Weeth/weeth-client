import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  activeBoardId: null as number | null,
};

export type BoardNavState = typeof initialState;

export const useBoardNavStore = create(
  devtools(
    combine(initialState, (set) => ({
      setActiveBoardId: (id: number | null) => set({ activeBoardId: id }, false, 'setActiveBoardId'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'BoardNavStore' },
  ),
);

export const useActiveBoardId = () => useBoardNavStore((store) => store.activeBoardId);
export const useSetActiveBoardId = () =>
  useBoardNavStore((store) => store.setActiveBoardId);
export const useBoardNavReset = () =>
  useBoardNavStore((store) => store.reset);
