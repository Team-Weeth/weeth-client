'use client';

import dynamic from 'next/dynamic';
import { MyPageSkeleton } from './MyPageSkeleton';

const MyPageContent = dynamic(() => import('./MyPageContent').then((m) => m.MyPageContent), {
  ssr: false,
  loading: () => <MyPageSkeleton />,
});

function MyPageClientWrapper() {
  return <MyPageContent />;
}

export { MyPageClientWrapper };
