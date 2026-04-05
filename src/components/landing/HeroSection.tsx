'use client';

import { motion, LayoutGroup } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  whiteCardVariants,
  greenCardVariants,
  topWrapperVariants,
  subtitleVariants,
  ctaVariants,
  heroImageVariants,
} from '@/components/landing/heroSection.variants';
import { InquiryDialog } from './InquiryDialog';
import { Button } from '../ui';
import Image from 'next/image';
import { HeroSectionCardImage, MobileHeroSectionCardImage } from '@/assets/icons/landing';

interface HeroSectionProps {
  className?: string;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const DESKTOP_BREAKPOINT = 696;

const TEXT_STYLE = {
  fontSize: 'clamp(72px, 13.9vw, 200px)',
  lineHeight: '160%',
  fontWeight: 700,
  letterSpacing: '-0.005em',
} as const;

function HeroSection({ className }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const oRef = useRef<HTMLSpanElement>(null);
  const [oWidth, setOWidth] = useState(0);
  const [showTexts, setShowTexts] = useState(false);
  const [animateHamkke, setAnimateHamkke] = useState(false);
  const [animateBounce, setAnimateBounce] = useState(false);
  const [bounceRatio, setBounceRatio] = useState(1);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    const check = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (oRef.current) setOWidth(oRef.current.offsetWidth);
  }, [showTexts]);

  useEffect(() => {
    if (!isDesktop) return;

    const t1 = setTimeout(() => setShowTexts(true), 500);
    const t2 = setTimeout(() => setAnimateHamkke(true), 1400);
    const t3 = setTimeout(() => {
      if (wrapperRef.current && oRef.current) {
        const available = window.innerWidth - wrapperRef.current.getBoundingClientRect().right;
        const needed = oRef.current.offsetWidth * 0.35;
        setBounceRatio(needed > 0 ? Math.min(1, Math.max(0, available / needed)) : 1);
      }
      setAnimateBounce(true);
    }, 3100);
    const t4 = setTimeout(() => {
      if (wrapperRef.current) wrapperRef.current.style.overflow = 'visible';
      if (sectionRef.current) sectionRef.current.style.overflow = 'visible';
    }, 3100);
    const t5 = setTimeout(() => {
      if (sectionRef.current) sectionRef.current.style.overflow = 'hidden';
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isDesktop]);

  if (!mounted) {
    return (
      <section className={cn('min-h-[calc(100vh+64px)] bg-[#D5E4FF]', className)} aria-hidden />
    );
  }

  if (!isDesktop) {
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
          <InquiryDialog>
            <Button variant="primary" size="lg">
              가입 문의하기
            </Button>
          </InquiryDialog>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative flex min-h-[calc(100vh+64px)] max-w-full flex-col overflow-hidden bg-[#D5E4FF]',
        className,
      )}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        className="relative flex flex-1 flex-col items-center justify-center"
      >
        <motion.div variants={topWrapperVariants}>
          <LayoutGroup>
            <motion.div
              layout
              animate={
                animateBounce && oWidth > 0
                  ? { x: [0, -(oWidth * 0.35 * bounceRatio), 0] }
                  : { x: 0 }
              }
              transition={{
                x: {
                  duration: 0.7,
                  ease: ['easeOut', [0.56, 0.01, 0.62, 1.37]],
                  times: [0, 0.571, 1],
                },
              }}
              className="flex items-center gap-600"
            >
              {showTexts && (
                <div style={{ overflow: 'hidden' }}>
                  <motion.span
                    initial={{ y: 135, opacity: 0 }}
                    animate={{ y: animateHamkke ? 0 : 135, opacity: animateHamkke ? 1 : 0 }}
                    transition={{ duration: 0.55, ease: [0.15, 0.89, 1, 1] }}
                    className="block font-[family-name:var(--font-inter)] whitespace-nowrap text-black select-none"
                    style={TEXT_STYLE}
                  >
                    함께
                  </motion.span>
                </div>
              )}

              <motion.div
                layout
                transition={{ layout: { duration: 0.55, ease: [0.15, 0.89, 1, 1] } }}
                style={{
                  width: 'clamp(220px, 29.9vw, 430px)',
                  height: 'clamp(260px, 35.4vw, 510px)',
                }}
                className="relative z-10 flex-shrink-0"
              >
                <motion.div
                  variants={whiteCardVariants}
                  className="absolute inset-0 z-0 rounded-3xl bg-white"
                />
                <motion.div
                  variants={greenCardVariants}
                  className="absolute inset-0 z-0 rounded-3xl bg-[#00C8AA]"
                />
                <motion.div
                  variants={heroImageVariants}
                  className="relative z-10 flex h-full w-full flex-col rounded-3xl bg-[#DDFFF8] p-[clamp(16px,2.2vw,32px)]"
                >
                  <Image
                    src={HeroSectionCardImage}
                    alt="Hero Section Card Image"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </motion.div>

              {showTexts && (
                <motion.div
                  ref={wrapperRef}
                  initial={{ opacity: 0, y: 120 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.15, 0.89, 1, 1], delay: 1.85 }}
                >
                  <span
                    className="flex font-[family-name:var(--font-inter)] whitespace-nowrap text-black select-none"
                    style={TEXT_STYLE}
                  >
                    더&nbsp;
                    <motion.span
                      ref={oRef}
                      animate={
                        animateBounce ? { scaleX: [1, 1 + 0.7 * bounceRatio, 1] } : { scaleX: 1 }
                      }
                      transition={{
                        duration: 0.7,
                        ease: ['easeOut', [0.56, 0.01, 0.62, 1.37]],
                        times: [0, 0.571, 1],
                      }}
                      style={{ display: 'inline-block', transformOrigin: 'left center' }}
                    >
                      오
                    </motion.span>
                    <motion.span
                      animate={
                        animateBounce && oWidth > 0
                          ? { x: [0, oWidth * 0.7 * bounceRatio, 0] }
                          : { x: 0 }
                      }
                      transition={{
                        duration: 0.7,
                        ease: ['easeOut', [0.56, 0.01, 0.62, 1.37]],
                        times: [0, 0.571, 1],
                      }}
                      style={{ display: 'inline-block' }}
                    >
                      래
                    </motion.span>
                  </span>
                </motion.div>
              )}
            </motion.div>
          </LayoutGroup>
        </motion.div>

        <div className="desktop:mt-[90px] mt-[40px] flex flex-col items-center gap-[15px]">
          <motion.p variants={subtitleVariants} className="typo-sub1 text-[#434343]">
            Weeth에서 동아리의 추억을 쌓아보세요
          </motion.p>
          <motion.div variants={ctaVariants}>
            <div className="flex gap-3">
              <InquiryDialog>
                <Button variant="primary" size="lg">
                  가입 문의하기
                </Button>
              </InquiryDialog>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export { HeroSection };
