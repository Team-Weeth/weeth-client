'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface BackOrHomeButtonProps {
  fallbackHref: string;
  children: ReactNode;
}

function BackOrHomeButton({ fallbackHref, children }: BackOrHomeButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    const hasSameOriginReferrer =
      typeof document !== 'undefined' &&
      document.referrer !== '' &&
      new URL(document.referrer).origin === window.location.origin;

    if (hasSameOriginReferrer && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <Button variant="primary" size="md" onClick={handleClick}>
      {children}
    </Button>
  );
}

export { BackOrHomeButton, type BackOrHomeButtonProps };
