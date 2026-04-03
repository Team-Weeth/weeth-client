import { Suspense } from 'react';

import { HomePageEntry } from '@/components/home/HomePageEntry';

export default function HomePage() {
  return (
    <div>
      <Suspense>
        <HomePageEntry />
      </Suspense>
    </div>
  );
}
