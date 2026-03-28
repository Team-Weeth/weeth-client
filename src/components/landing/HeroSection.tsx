'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui';
import LandingHeroImageIcon from '@/assets/icons/landing/landing_hero_image.svg';
import {
  DELAY,
  whiteCardVariants,
  greenCardVariants,
  leftWrapperVariants,
  rightWrapperVariants,
  leftTextVariants,
  rightTextVariants,
  oCharVariants,
  raeCharVariants,
  topWrapperVariants,
  subtitleVariants,
  ctaVariants,
} from '@/components/landing/heroSection.variants';

interface HeroSectionProps {
  className?: string;
}

function HeroSection({ className }: HeroSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.overflow = 'visible';
      }
    }, DELAY.bounce * 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className={cn(
        'relative flex min-h-screen w-full flex-col overflow-hidden bg-[#D5E4FF]',
        className,
      )}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        className="relative flex flex-1 flex-col items-center justify-center"
      >
        <motion.div variants={topWrapperVariants} className="flex items-center gap-600">
          <motion.div variants={leftWrapperVariants} className="overflow-hidden">
            <div className="overflow-hidden">
              <motion.span
                variants={leftTextVariants}
                className="block font-[family-name:var(--font-inter)] whitespace-nowrap text-black select-none"
                style={{
                  fontSize: '200px',
                  lineHeight: '160%',
                  fontWeight: 700,
                  letterSpacing: '-0.005em',
                }}
              >
                함께
              </motion.span>
            </div>
          </motion.div>

          <div className="relative z-10 h-[510px] w-[430px] flex-shrink-0">
            <motion.div
              variants={whiteCardVariants}
              className="absolute inset-0 z-0 h-[510px] w-[430px] rounded-3xl bg-white"
            />
            <motion.div
              variants={greenCardVariants}
              className="absolute inset-0 z-0 h-[510px] w-[430px] rounded-3xl bg-[#00C8AA]"
            />
            <Image
              src={LandingHeroImageIcon}
              alt="landing-image"
              width={430}
              height={510}
              priority
              className="relative z-10 h-[510px] w-[430px] -rotate-5 rounded-3xl"
            />
          </div>

          <motion.div
            ref={wrapperRef}
            variants={rightWrapperVariants}
            style={{ overflow: 'hidden', width: 0 }}
          >
            <motion.span
              variants={rightTextVariants}
              className="flex font-[family-name:var(--font-inter)] whitespace-nowrap text-black select-none"
              style={{
                fontSize: '200px',
                lineHeight: '160%',
                fontWeight: 700,
                letterSpacing: '-0.005em',
              }}
            >
              더&nbsp;
              <motion.span
                variants={oCharVariants}
                style={{ display: 'inline-block', transformOrigin: 'left center' }}
              >
                오
              </motion.span>
              <motion.span variants={raeCharVariants} style={{ display: 'inline-block' }}>
                래
              </motion.span>
            </motion.span>
          </motion.div>
        </motion.div>

        <div className="mt-[90px] flex flex-col items-center gap-[15px]">
          <motion.p variants={subtitleVariants} className="typo-sub1 text-[#434343]">
            Weeth에서 동아리의 추억을 쌓아보세요
          </motion.p>
          <motion.div variants={ctaVariants}>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: 'primary', size: 'lg' }),
                'bg-[#00C8AA] text-white',
              )}
            >
              지금 무료로 시작하기
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export { HeroSection };
