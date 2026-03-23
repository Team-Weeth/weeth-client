'use client';

import dynamic from 'next/dynamic';

export const HeroSection = dynamic(
  () => import('@/components/landing/HeroSection').then((m) => ({ default: m.HeroSection })),
  { ssr: false },
);

export const PhilosophySection = dynamic(
  () =>
    import('@/components/landing/PhilosophySection').then((m) => ({
      default: m.PhilosophySection,
    })),
  { ssr: false },
);
