import type { BoardType } from '@/types/board';

export const BOARD_TYPE_ORDER: Record<BoardType, number> = {
  NOTICE: 0,
  ALL: 1,
  GENERAL: 2,
};

export const BOARD_STALE_TIME = 5 * 60 * 1000;
export const BOARD_GC_TIME = 10 * 60 * 1000;
export const DEFAULT_PAGE_SIZE = 10;
