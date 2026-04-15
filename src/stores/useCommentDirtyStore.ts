import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  dirty: false,
};

export type CommentDirtyState = typeof initialState;

export const useCommentDirtyStore = create(
  devtools(
    combine(initialState, (set) => ({
      setDirty: (dirty: boolean) => set({ dirty }, false, 'setDirty'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'CommentDirtyStore' },
  ),
);

export const useCommentDirty = () => useCommentDirtyStore((store) => store.dirty);
export const useSetCommentDirty = () => useCommentDirtyStore((store) => store.setDirty);
export const useCommentDirtyReset = () => useCommentDirtyStore((store) => store.reset);
