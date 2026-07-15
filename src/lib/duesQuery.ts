import { parseApiError } from '@/lib/error';

const DUES_PRIVATE_ERROR_CODE = 20114;

function shouldRetryDuesQuery(failureCount: number, error: unknown) {
  if (parseApiError(error)?.code === DUES_PRIVATE_ERROR_CODE) return false;

  return failureCount < 3;
}

export { DUES_PRIVATE_ERROR_CODE, shouldRetryDuesQuery };
