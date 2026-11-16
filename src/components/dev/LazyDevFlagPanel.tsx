'use client';

import dynamic from 'next/dynamic';

// 정적으로 import하면 렌더링하지 않는 운영에서도 패널과 Flagsmith SDK가 레이아웃 번들에 실린다.
const LazyDevFlagPanel = dynamic(
  () => import('@/components/dev/DevFlagPanel').then((module) => module.DevFlagPanel),
  { ssr: false },
);

export { LazyDevFlagPanel };
