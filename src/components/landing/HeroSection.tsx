'use client';

import { motion, LayoutGroup } from 'framer-motion';
// import Link from 'next/link';
// import Image from 'next/image';
// import { buttonVariants } from '@/components/ui';
import { useEffect, useRef, useState } from 'react';
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

interface HeroSectionProps {
  className?: string;
}

const TEXT_STYLE = {
  fontSize: '200px',
  lineHeight: '160%',
  fontWeight: 700,
  letterSpacing: '-0.005em',
} as const;

function HeroSection({ className }: HeroSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const oRef = useRef<HTMLSpanElement>(null);
  const [oWidth, setOWidth] = useState(0);
  const [showTexts, setShowTexts] = useState(false);
  const [animateHamkke, setAnimateHamkke] = useState(false);
  const [animateBounce, setAnimateBounce] = useState(false);

  useEffect(() => {
    if (oRef.current) setOWidth(oRef.current.offsetWidth);
  }, [showTexts]);

  useEffect(() => {
    // 500ms: 두 텍스트 DOM 추가 (카드 layout 이동 시작)
    const t1 = setTimeout(() => setShowTexts(true), 500);
    // 1400ms: 카드 이동 완료 후 함께 슬라이드업
    const t2 = setTimeout(() => setAnimateHamkke(true), 1400);
    // 3100ms: 더 오래 완료(2350+600ms) 후 오 바운스
    const t3 = setTimeout(() => setAnimateBounce(true), 3100);
    const t4 = setTimeout(() => {
      if (wrapperRef.current) wrapperRef.current.style.overflow = 'visible';
    }, 3100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <section
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
              animate={animateBounce && oWidth > 0 ? { x: [0, -(oWidth * 0.35), 0] } : { x: 0 }}
              transition={{
                x: {
                  duration: 0.7,
                  ease: ['easeOut', [0.56, 0.01, 0.62, 1.37]],
                  times: [0, 0.571, 1],
                },
              }}
              className="flex items-center gap-600"
            >
              {/* 함께 — 500ms에 DOM 추가, 바로 슬라이드업 */}
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

              {/* 카드 — layout으로 부드럽게 이동 */}
              <motion.div
                layout
                transition={{ layout: { duration: 0.55, ease: [0.15, 0.89, 1, 1] } }}
                className="relative z-10 h-[510px] w-[430px] flex-shrink-0"
              >
                <motion.div
                  variants={whiteCardVariants}
                  className="absolute inset-0 z-0 h-[510px] w-[430px] rounded-3xl bg-white"
                />
                <motion.div
                  variants={greenCardVariants}
                  className="absolute inset-0 z-0 h-[510px] w-[430px] rounded-3xl bg-[#00C8AA]"
                />
                <motion.div
                  variants={heroImageVariants}
                  className="relative z-10 flex h-[510px] w-[430px] flex-col rounded-3xl bg-[#DDFFF8] p-[32px]"
                >
                  {/* TODO: svg 교체 */}
                  <svg
                    width="140"
                    height="150"
                    viewBox="0 0 33 34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Weeth 로고"
                  >
                    <path
                      d="M8.42176 33.1933L4.0278 17.0821H10.0695V23.1238L12.0834 17.0821L16.1112 13.0543L20.139 21.1099L21.6036 4.99876L28.1945 2.98486L26.1807 23.1238L23.8006 33.1933L16.1112 31.1794L14.0973 23.1238L12.0834 33.1933H8.42176Z"
                      fill="#00C8AA"
                    />
                    <circle cx="9.39819" cy="6.34158" r="5.37039" fill="#00C8AA" />
                  </svg>
                  <div className="mt-auto flex flex-col gap-[6px]">
                    <p className="text-4xl leading-[62px] font-bold tracking-[-0.4px] text-[#00C8AA]">
                      우리 동아리만의 공간,
                      <br />
                      동아리 관리 서비스
                    </p>
                    <p className="text-4xl leading-[62px] font-bold tracking-[-0.4px] text-[#00C8AA]">
                      Weeth에서 시작해요
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* 더 오래 — 500ms에 DOM 추가, 400ms 뒤에 슬라이드업 */}
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
                      animate={animateBounce ? { scaleX: [1, 1.7, 1] } : { scaleX: 1 }}
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
                      animate={animateBounce && oWidth > 0 ? { x: [0, oWidth * 0.7, 0] } : { x: 0 }}
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

        <div className="mt-[90px] flex flex-col items-center gap-[15px]">
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
            {/* <Link
              href="/login?intent=create"
              className={cn(
                buttonVariants({ variant: 'primary', size: 'lg' }),
                'bg-[#00C8AA] text-white',
              )}
            >
              지금 무료로 시작하기
            </Link> */}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export { HeroSection };
