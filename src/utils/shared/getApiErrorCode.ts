import { isAxiosError } from 'axios';

export function getApiErrorCode(err: unknown): number | undefined {
  if (!isAxiosError(err)) return undefined;
  const code = err.response?.data?.code;
  return typeof code === 'number' ? code : undefined;
}
