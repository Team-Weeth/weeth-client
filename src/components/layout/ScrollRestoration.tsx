'use client';

import { useScrollToTopOnNavigate } from '@/hooks';

function ScrollRestoration() {
  useScrollToTopOnNavigate();
  return null;
}

export { ScrollRestoration };
