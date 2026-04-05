'use client';

import { cn } from '@/lib/cn';
import { HeroSectionDesktop } from './HeroSectionDesktop';
import { HeroSectionMobile } from './HeroSectionMobile';
import { type HeroSectionProps } from './heroSection.shared';

function HeroSection({ className }: HeroSectionProps) {
  return (
    <>
      <HeroSectionMobile className={cn('tablet:hidden', className)} />
      <HeroSectionDesktop className={cn('hidden tablet:flex', className)} />
    </>
  );
}

export { HeroSection };
