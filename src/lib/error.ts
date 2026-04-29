import type { AxiosError } from 'axios';
import { BOARD_PAGE_ERRORS } from '@/constants/board/error';

interface ErrorInfo {
  message: string;
  retryable: boolean;
}

interface ParsedApiError {
  status: number;
  code: number;
  message: string;
}

/**
 * API 에러를 파싱하여 { status, code, message }를 반환.
 * - Server Action 에러: "[status:code] message" 형식
 * - AxiosError: response.data.code / response.status 에서 추출
 */
export function parseApiError(error: unknown): ParsedApiError | null {
  if (!(error instanceof Error)) return null;

  // Server Action: "[status:code] message"
  const match = error.message.match(/^\[(\d+):(\d+)\]\s(.+)$/);
  if (match) return { status: Number(match[1]), code: Number(match[2]), message: match[3] };

  // AxiosError: response.data.{ code, message }
  const axiosErr = error as AxiosError<{ code?: number; message?: string }>;
  const responseData = axiosErr?.response?.data;
  if (responseData?.code != null) {
    return {
      status: axiosErr.response?.status ?? 0,
      code: responseData.code,
      message: responseData.message ?? error.message,
    };
  }

  return null;
}

export function getBoardErrorInfo(error: Error): ErrorInfo {
  const parsed = parseApiError(error);
  if (!parsed)
    return { message: '일시적인 오류가 발생했어요. 다시 시도해주세요.', retryable: true };

  const known = BOARD_PAGE_ERRORS[parsed.code];
  if (known) return known;

  return { message: '게시글을 불러오지 못했습니다', retryable: true };
}
