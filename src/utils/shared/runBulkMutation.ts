import { toastError, toastSuccess } from '@/stores/useToastStore';

interface BulkMutationMessages {
  success: string;
  error: string;
}

export async function runBulkMutation<TArg, TResult>(
  args: TArg[],
  mutateAsync: (arg: TArg) => Promise<TResult>,
  messages: BulkMutationMessages,
  resolveErrorMessage?: (errors: unknown[]) => string | undefined,
): Promise<void> {
  const results = await Promise.allSettled(args.map(mutateAsync));
  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) => r.reason);
  if (errors.length > 0) {
    toastError(resolveErrorMessage?.(errors) ?? messages.error);
    return;
  }
  toastSuccess(messages.success);
}
