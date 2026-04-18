import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import type { BoardType } from '@/types/board';

const initialState = {
  activeBoardId: null as number | null,
  /** boardId → BoardType 매핑 (NOTICE 게시판 판별용) */
  boardTypeMap: {} as Record<number, BoardType>,
};

export type BoardNavState = typeof initialState;

export const useBoardNavStore = create(
  devtools(
    combine(initialState, (set, get) => ({
      setActiveBoardId: (id: number | null) =>
        set({ activeBoardId: id }, false, 'setActiveBoardId'),
      setBoardTypeMap: (map: Record<number, BoardType>) =>
        set({ boardTypeMap: map }, false, 'setBoardTypeMap'),
      isNoticeBoard: (boardId: number) => get().boardTypeMap[boardId] === 'NOTICE',
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'BoardNavStore' },
  ),
);

export const useActiveBoardId = () => useBoardNavStore((store) => store.activeBoardId);
export const useSetActiveBoardId = () => useBoardNavStore((store) => store.setActiveBoardId);
export const useBoardNavReset = () => useBoardNavStore((store) => store.reset);
export const useIsNoticeBoard = () => useBoardNavStore((store) => store.isNoticeBoard);
export const useSetBoardTypeMap = () => useBoardNavStore((store) => store.setBoardTypeMap);
