import { BOARD_PAGE_ERRORS } from '@/constants/board/error';

interface ErrorInfo {
  message: string;
  retryable: boolean;
}

/**
 * error.message에서 "[status:code] message" 패턴을 파싱
 */
function parseApiError(error: Error): { status: number; code: number; message: string } | null {
  const match = error.message.match(/^\[(\d+):(\d+)\]\s(.+)$/);
  if (!match) return null;
  return { status: Number(match[1]), code: Number(match[2]), message: match[3] };
}

export function getBoardErrorInfo(error: Error): ErrorInfo {
  const parsed = parseApiError(error);
  if (!parsed)
    return { message: '일시적인 오류가 발생했어요. 다시 시도해주세요.', retryable: true };

  const known = BOARD_PAGE_ERRORS[parsed.code];
  if (known) return known;

  return { message: '게시글을 불러오지 못했습니다', retryable: true };
}
