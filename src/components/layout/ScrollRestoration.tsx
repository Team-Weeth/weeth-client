'use client';

import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate';

function ScrollRestoration() {
  useScrollToTopOnNavigate();
  return null;
}

export { ScrollRestoration };
