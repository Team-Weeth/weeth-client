'use client';

import { useEffect, useState } from 'react';
import type { StaticImageData } from 'next/image';
import { ServiceSectionDesktop } from './ServiceSectionDesktop';
import { ServiceSectionTablet } from './ServiceSectionTablet';
import { ServiceSectionMobile } from './ServiceSectionMobile';

interface Feature {
  chipLabel: string;
  cardTitle: string;
  description: string;
  bgColor: string;
  image?: StaticImageData;
  video?: string;
  poster?: StaticImageData;
  highlightKeyword?: string;
}

interface ServiceSectionProps {
  className?: string;
  variant: 'user' | 'admin';
  title: string;
  subtitle: string;
  serviceLabel: string;
  features: Feature[];
}

const TABLET_BP = 696;
const DESKTOP_BP = 1440;

function ServiceSection(props: ServiceSectionProps) {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= DESKTOP_BP) setBp('desktop');
      else if (window.innerWidth >= TABLET_BP) setBp('tablet');
      else setBp('mobile');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (bp === 'desktop') return <ServiceSectionDesktop {...props} />;
  if (bp === 'tablet') return <ServiceSectionTablet {...props} />;
  return <ServiceSectionMobile {...props} />;
}

export { ServiceSection };
export type { Feature };
