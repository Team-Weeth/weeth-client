'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWindowSize } from 'react-use';
import { Button } from '../ui';

gsap.registerPlugin(ScrollTrigger);

const CARD_BORDER_RADIUS = '40px';
const TARGET_WIDTH = 1122;
const TARGET_HEIGHT = 499;
const SIDE_MARGIN = 18;

function CTASection({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

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
    },
    { scope: containerRef, dependencies: [windowWidth, windowHeight], revertOnUpdate: true },
  );

  const handleAsk = () => {};

  return (
    <div ref={containerRef} className={className} style={{ height: 'calc(100vh + 600px)' }}>
      <section className="sticky top-0 flex min-h-screen w-full items-center justify-center bg-[#00C8AA]">
        <div
          ref={cardRef}
          className="flex h-screen w-full flex-col items-center justify-center bg-white"
        >
          <h2 className="mb-[14px] text-center text-[64px] leading-[130%] font-bold tracking-[-0.005em] text-[#1E2021]">
            함께하는 순간이
            <br />더 오래 이어지도록
          </h2>
          <p className="mb-[63px] text-center text-[16px] leading-[24px] font-semibold tracking-[-0.005em] text-black">
            동아리 정보를 입력하고,
            <br />
            3분 만에 사이트를 개설해보세요.
          </p>
          <div className="flex gap-3">
            <Button variant={'primary'} onClick={handleAsk}>
              가입문의
            </Button>
            {/* <Link
              href="/login?intent=create"
              className="typo-button1 block w-fit rounded-md bg-[#00C8AA] px-400 py-300 text-white hover:bg-[#00877a]"
            >
              지금 무료로 시작하기
            </Link>
            <Link
              href="/contact"
              className="typo-button1 block w-fit rounded-md bg-[#E6EAED] px-400 py-300 text-black hover:bg-[#b7bcbf]"
            >
              가입 문의
            </Link> */}
          </div>
        </div>
      </section>
    </div>
  );
}

export { CTASection };
