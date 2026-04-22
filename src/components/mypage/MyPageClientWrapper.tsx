'use client';

import dynamic from 'next/dynamic';

const MyPageContent = dynamic(() => import('./MyPageContent').then((m) => m.MyPageContent), {
  ssr: false,
});

function MyPageClientWrapper() {
  return <MyPageContent />;
}

export { MyPageClientWrapper };
