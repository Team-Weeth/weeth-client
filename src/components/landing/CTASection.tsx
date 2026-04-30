'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWindowSize } from 'react-use';
import { InquiryDialog } from './InquiryDialog';

gsap.registerPlugin(ScrollTrigger);

const CARD_BORDER_RADIUS = '40px';
const TARGET_WIDTH = 1122;
const TARGET_HEIGHT = 499;
const SIDE_MARGIN = 18;

function CTASection({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize({
    initialWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    initialHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useGSAP(
    () => {
      const container = containerRef.current;
      const card = cardRef.current;
      if (!container || !card) return;

      const sideInset = Math.max((windowWidth - TARGET_WIDTH) / 2, SIDE_MARGIN);
      const topInset = Math.max((windowHeight - TARGET_HEIGHT) / 2, 0);

      gsap.fromTo(
        card,
        { clipPath: `inset(101px 18px 101px 18px round ${CARD_BORDER_RADIUS})` },
        {
          clipPath: `inset(${topInset}px ${sideInset}px ${topInset}px ${sideInset}px round ${CARD_BORDER_RADIUS})`,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '+=600',
            scrub: 1,
          },
        },
      );

      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(raf);
    },
    { scope: containerRef, dependencies: [windowWidth, windowHeight], revertOnUpdate: true },
  );

  return (
    <div ref={containerRef} className={className} style={{ height: 'calc(100vh + 600px)' }}>
      <section className="sticky top-0 flex min-h-screen w-full items-center justify-center bg-[#00C8AA]">
        <div
          ref={cardRef}
          className="flex h-screen w-full flex-col items-center justify-center bg-white"
        >
          <h2 className="tablet:text-[48px] desktop:text-[64px] mb-[14px] text-center text-[32px] leading-[130%] font-bold tracking-[-0.005em] text-[#1E2021]">
            함께하는 순간이
            <br />더 오래 이어지도록
          </h2>
          <p className="tablet:text-[16px] tablet:leading-[24px] desktop:mb-[63px] mb-[40px] text-center text-[14px] leading-[22px] font-semibold tracking-[-0.005em] text-black">
            동아리 정보를 입력하고,
            <br />
            3분 만에 사이트를 개설해보세요.
          </p>
          <div className="flex gap-3">
            <InquiryDialog>
              <button className="typo-button1 flex-1 rounded-md bg-[#00C8AA] px-400 py-300 text-white hover:bg-[#00877a]">
                지금 무료로 시작하기
              </button>
            </InquiryDialog>
          </div>
        </div>
      </section>
    </div>
  );
}

export { CTASection };
