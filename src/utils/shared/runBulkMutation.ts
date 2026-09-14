import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorMessage } from './getApiErrorCode';

interface BulkMutationMessages {
  success: string;
  error: string;
}

export async function runBulkMutation<TArg, TResult>(
  args: TArg[],
  mutateAsync: (arg: TArg) => Promise<TResult>,
  messages: BulkMutationMessages,
  resolveErrorMessage?: (errors: unknown[]) => string | undefined,
): Promise<boolean> {
  if (args.length === 0) return false;
  const results = await Promise.allSettled(args.map(mutateAsync));
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => r.reason);
  if (errors.length > 0) {
    const serverMessage = errors.map(getApiErrorMessage).find((message) => message?.trim());
    toastError(serverMessage ?? resolveErrorMessage?.(errors) ?? messages.error);
    return false;
  }
  toastSuccess(messages.success);
  return true;
}
