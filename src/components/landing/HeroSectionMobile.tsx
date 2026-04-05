'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MobileHeroSectionCardImage } from '@/assets/icons/landing';
import { cn } from '@/lib/cn';
import { HeroSectionCTA, type HeroSectionProps } from './heroSection.shared';

function HeroSectionMobile({ className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        'flex min-h-[calc(100vh+64px)] flex-col items-center justify-center gap-[32px] overflow-hidden bg-[#D5E4FF] px-600 py-[60px]',
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.15, 0.89, 1, 1], delay: 0.15 }}
        className="flex flex-col items-center text-center"
      >
        <span
          className="block font-[family-name:var(--font-inter)] text-black select-none"
          style={{
            fontSize: '64px',
            lineHeight: '100%',
            fontWeight: 700,
            letterSpacing: '-0.005em',
          }}
        >
          함께
        </span>
        <span
          className="block font-[family-name:var(--font-inter)] text-black select-none"
          style={{
            fontSize: '64px',
            lineHeight: '100%',
            fontWeight: 700,
            letterSpacing: '-0.005em',
          }}
        >
          더 오래
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60, rotate: -16.38 }}
        animate={{ opacity: 1, y: 0, rotate: -5.61 }}
        transition={{ duration: 0.6, ease: [0.15, 0.89, 1, 1] }}
        className="relative h-[366px] w-[335px] flex-shrink-0"
      >
        <Image
          src={MobileHeroSectionCardImage}
          alt="Hero Section Card Image"
          fill
          className="object-contain"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.15, 0.89, 1, 1], delay: 0.3 }}
        className="flex flex-col items-center gap-[12px]"
      >
        <p className="typo-sub2 text-center text-[#434343]">
          Weeth에서 동아리의 추억을 쌓아보세요
        </p>
        <HeroSectionCTA />
      </motion.div>
    </section>
  );
}

export { HeroSectionMobile };
