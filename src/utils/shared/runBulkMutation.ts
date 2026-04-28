import { toastError, toastSuccess } from '@/stores/useToastStore';

interface BulkMutationMessages {
  success: string;
  error: string;
}

export async function runBulkMutation<TArg, TResult>(
  args: TArg[],
  mutateAsync: (arg: TArg) => Promise<TResult>,
  messages: BulkMutationMessages,
): Promise<void> {
  const results = await Promise.allSettled(args.map(mutateAsync));
  if (results.some((r) => r.status === 'rejected')) {
    toastError(messages.error);
    return;
  }
  toastSuccess(messages.success);
}
