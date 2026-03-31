'use client';

import { lazy } from 'react';

export const Banner = lazy(() =>
  import('@/components/home/Banner').then((m) => ({ default: m.Banner })),
);

export const LeftContainer = lazy(() =>
  import('@/components/home/LeftContainer').then((m) => ({ default: m.LeftContainer })),
);

export const MainContainer = lazy(() =>
  import('@/components/home/MainContainer').then((m) => ({ default: m.MainContainer })),
);

export const RightContainer = lazy(() =>
  import('@/components/home/RightContainer').then((m) => ({ default: m.RightContainer })),
);
