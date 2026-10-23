import type { Metadata } from 'next';
import { Suspense } from 'react';

import { HomePageEntry } from '@/components/home/HomePageEntry';

export const metadata: Metadata = { title: '홈' };

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<div className="bg-background min-h-screen" />}>
        <HomePageEntry />
      </Suspense>
    </div>
  );
}
