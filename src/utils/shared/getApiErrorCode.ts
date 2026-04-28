import { isAxiosError } from 'axios';

export function getApiErrorCode(err: unknown): number | undefined {
  return isAxiosError(err) ? err.response?.data?.code : undefined;
}
