'use client';

import dynamic from 'next/dynamic';

export const PhilosophySection = dynamic(() =>
  import('@/components/landing/PhilosophySection').then((m) => ({
    default: m.PhilosophySection,
  })),
);

export const ServiceSection = dynamic(() =>
  import('@/components/landing/ServiceSection').then((m) => ({
    default: m.ServiceSection,
  })),
);

export const SetupGuideSection = dynamic(() =>
  import('@/components/landing/SetupGuideSection').then((m) => ({
    default: m.SetupGuideSection,
  })),
);

export const CTASection = dynamic(() =>
  import('@/components/landing/CTASection').then((m) => ({
    default: m.CTASection,
  })),
);
