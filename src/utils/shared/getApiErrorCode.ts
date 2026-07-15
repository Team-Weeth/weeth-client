import { isAxiosError } from 'axios';

export function getApiErrorCode(err: unknown): number | undefined {
  if (!isAxiosError(err)) return undefined;
  const code = err.response?.data?.code;
  return typeof code === 'number' ? code : undefined;
}

export function getApiErrorMessage(err: unknown): string | undefined {
  if (!isAxiosError(err)) return undefined;
  const message = err.response?.data?.message;
  return typeof message === 'string' ? message : undefined;
}
