'use client';

import { useEffect, useState } from 'react';
import type { StaticImageData } from 'next/image';
import { ServiceSectionDesktop } from './ServiceSectionDesktop';
import { ServiceSectionMobile } from './ServiceSectionMobile';

interface Feature {
  chipLabel: string;
  cardTitle: string;
  description: string;
  bgColor: string;
  image?: StaticImageData;
  video?: string;
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

const DESKTOP_BP = 1032;

function ServiceSection(props: ServiceSectionProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BP);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isDesktop) return <ServiceSectionDesktop {...props} />;
  return <ServiceSectionMobile {...props} />;
}

export { ServiceSection };
export type { Feature };
