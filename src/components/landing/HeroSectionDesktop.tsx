'use client';

import Image from 'next/image';
import { LayoutGroup, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { HeroSectionCardImage } from '@/assets/icons/landing';
import { cn } from '@/lib/cn';
import {
  ctaVariants,
  greenCardVariants,
  heroImageVariants,
  subtitleVariants,
  topWrapperVariants,
  whiteCardVariants,
} from '@/components/landing/heroSection.variants';
import { HeroSectionCTA, TEXT_STYLE, type HeroSectionProps } from './heroSection.shared';

function HeroSectionDesktop({ className }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const oRef = useRef<HTMLSpanElement>(null);
  const [oWidth, setOWidth] = useState(0);
  const [showTexts, setShowTexts] = useState(false);
  const [animateHamkke, setAnimateHamkke] = useState(false);
  const [animateBounce, setAnimateBounce] = useState(false);
  const [bounceRatio, setBounceRatio] = useState(1);

  useEffect(() => {
    if (oRef.current) setOWidth(oRef.current.offsetWidth);
  }, [showTexts]);

  useEffect(() => {
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
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative flex min-h-[calc(100vh+64px)] max-w-full flex-col overflow-hidden bg-[#D5E4FF] pt-[96px]',
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
          <motion.p variants={subtitleVariants} className="typo-sub2 text-[#434343]">
            Weeth에서 동아리의 추억을 쌓아보세요
          </motion.p>
          <motion.div variants={ctaVariants}>
            <HeroSectionCTA />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export { HeroSectionDesktop };
