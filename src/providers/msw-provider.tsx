'use client';

import { useEffect, useState } from 'react';

const isMockEnabled =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';

let mswInitialized = false;

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!isMockEnabled || mswInitialized);

  useEffect(() => {
    if (!isMockEnabled || mswInitialized) {
      setReady(true);
      return;
    }

    import('@/mocks/browser').then(({ worker }) => {
      worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
        mswInitialized = true;
        setReady(true);
      });
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
