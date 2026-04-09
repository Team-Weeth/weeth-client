/**
 * Board 도메인 에러 코드
 * @see /api/v4/docs/exceptions/board
 */

/** 페이지 에러 — error.tsx에서 처리 */
export const BOARD_PAGE_ERRORS: Record<number, { message: string; retryable: boolean }> = {
  20400: { message: '검색 결과가 없습니다', retryable: false },
  20401: { message: '유효하지 않은 페이지입니다', retryable: false },
};

/** 액션 에러 — 토스트로 처리 */
export const BOARD_ACTION_ERRORS: Record<number, string> = {
  20402: '해당 카테고리에 대한 권한이 없습니다',
  20409: '이미 존재하는 게시판 이름입니다',
  20413: '잠시 후 다시 시도해주세요',
};
