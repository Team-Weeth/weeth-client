'use client';

import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui';
import LandingHeroImageIcon from '@/assets/icons/landing/landing_hero_image.svg';
import Image from 'next/image';

interface HeroSectionProps {
  className?: string;
}

function HeroSection({ className }: HeroSectionProps) {
  const whiteCard = useAnimation();
  const greenCard = useAnimation();
  const leftWrapper = useAnimation();
  const leftText = useAnimation();
  const rightWrapper = useAnimation();
  const rightClip = useAnimation();
  const rightText = useAnimation();
  const oChar = useAnimation();
  const raeChar = useAnimation();
  const topWrapper = useAnimation();
  const subtitle = useAnimation();
  const cta = useAnimation();

  useEffect(() => {
    const run = async () => {
      await Promise.all([
        whiteCard.start({
          opacity: 1,
          x: 0,
          y: 0,
          rotate: -17,
          transition: { duration: 1.0, ease: 'easeOut' },
        }),
        greenCard.start({
          opacity: 1,
          x: 0,
          y: 0,
          rotate: -10,
          transition: { duration: 1.0, ease: 'easeOut' },
        }),
      ]);

      await Promise.all([
        leftWrapper.start({ width: 'auto', transition: { duration: 0.4, ease: 'easeOut' } }),
        rightWrapper.start({ width: 'auto', transition: { duration: 0.4, ease: 'easeOut' } }),
      ]);

      await leftText.start({ y: 0, transition: { duration: 0.55, ease: 'easeOut' } });
      await rightText.start({ y: 0, transition: { duration: 0.55, ease: 'easeOut' } });

      rightClip.start({ overflow: 'visible' });

      await Promise.all([
        oChar.start({ scaleX: 1.7, transition: { duration: 0.4, ease: 'easeOut' } }),
        raeChar.start({ x: 100, transition: { duration: 0.4, ease: 'easeOut' } }),
      ]);
      await Promise.all([
        oChar.start({ scaleX: 1, transition: { duration: 0.35, ease: 'easeIn' } }),
        raeChar.start({ x: 0, transition: { duration: 0.35, ease: 'easeIn' } }),
      ]);

      await Promise.all([
        topWrapper.start({ y: -55, transition: { duration: 0.8, ease: 'easeOut' } }),

        subtitle.start({ opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }),
        cta.start({ opacity: 1, transition: { duration: 0.8, ease: 'easeOut', delay: 0.1 } }),
      ]);
    };
    run();
  }, [
    whiteCard,
    greenCard,
    leftWrapper,
    leftText,
    rightWrapper,
    rightText,
    rightClip,
    oChar,
    raeChar,
    topWrapper,
    subtitle,
    cta,
  ]);

  return (
    <section
      className={cn(
        'relative flex min-h-screen w-full flex-col overflow-hidden bg-[#D5E4FF]',
        className,
      )}
    >
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <motion.div initial={{ y: 0 }} animate={topWrapper} className="flex items-center gap-600">
          <motion.div initial={{ width: 0 }} animate={leftWrapper} className="overflow-hidden">
            <div className="overflow-hidden">
              <motion.span
                initial={{ y: '100%' }}
                animate={leftText}
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
              initial={{ opacity: 0, x: '-60vw', y: '60vh', rotate: -68 }}
              animate={whiteCard}
              className="absolute inset-0 z-0 h-[510px] w-[430px] rounded-3xl bg-white"
            />
            <motion.div
              initial={{ opacity: 0, x: '60vw', y: '-60vh', rotate: 24 }}
              animate={greenCard}
              className="absolute inset-0 z-0 h-[510px] w-[430px] rounded-3xl bg-[#00C8AA]"
            />
            <Image
              src={LandingHeroImageIcon}
              alt="landing-image"
              width={430}
              height={510}
              className="relative z-10 h-[510px] w-[430px] -rotate-5 rounded-3xl"
            />
          </div>

          <motion.div initial={{ width: 0 }} animate={rightWrapper}>
            <motion.div initial={{ overflow: 'hidden' }} animate={rightClip}>
              <motion.span
                initial={{ y: '100%' }}
                animate={rightText}
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
                  initial={{ scaleX: 1 }}
                  animate={oChar}
                  style={{ display: 'inline-block', transformOrigin: 'left center' }}
                >
                  오
                </motion.span>
                <motion.span
                  initial={{ x: 0 }}
                  animate={raeChar}
                  style={{ display: 'inline-block' }}
                >
                  래
                </motion.span>
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="mt-[90px] flex flex-col items-center gap-[15px]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={subtitle}
            className="typo-sub1 text-[#434343]"
          >
            Weeth에서 동아리의 추억을 쌓아보세요
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={cta}>
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
      </div>
    </section>
  );
}

export { HeroSection };
