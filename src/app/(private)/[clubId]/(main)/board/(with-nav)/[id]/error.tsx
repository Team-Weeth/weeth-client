'use client';

import { getBoardErrorInfo } from '@/lib/error';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function PostDetailError({ error, reset }: ErrorProps) {
  const { message, retryable } = getBoardErrorInfo(error);

  return (
    <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-300 py-800">
      <p className="typo-body1 text-text-alternative">{message}</p>
      {retryable && (
        <button type="button" className="typo-button2 text-brand-primary" onClick={reset}>
          다시 시도
        </button>
      )}
    </main>
  );
}
