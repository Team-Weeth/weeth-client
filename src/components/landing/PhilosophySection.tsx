'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Marquee from 'react-fast-marquee';
import { useRef } from 'react';
import { Centered } from './Centered';
import Image from 'next/image';
import {
  LandingCard1,
  LandingCard2,
  LandingCard3,
  LandingCard4,
  LandingCard5,
  LandingCard6,
  LandingCard7,
  LandingCard8,
} from '@/assets/image/landing/card';

gsap.registerPlugin(ScrollTrigger);

const sentences = [
  '동아리를 운영하다 보면 세션 준비와 출석 관리, 공지 정리에 많은 시간을 쓰게 됩니다.',
  '그러다 보면 정작 동아리원과 함께 웃고 이야기할 시간은 조금씩 줄어들기도 합니다.',
  '우리는 운영이 사람보다 앞서지 않았으면 했습니다.',
  '동아리원이 중심이 되는 구조, 그 시간을 다시 사람에게 돌려주는 방식.',
  'Weeth는 그 고민을 해결해나가고 있습니다.',
];

const images = [
  LandingCard1,
  LandingCard2,
  LandingCard3,
  LandingCard4,
  LandingCard5,
  LandingCard6,
  LandingCard7,
  LandingCard8,
];

function PhilosophySection() {
  const rootRef = useRef<HTMLDivElement>(null);

  const statement1Ref = useRef<HTMLSpanElement>(null);
  const statement2Ref = useRef<HTMLSpanElement>(null);
  const statement3Ref = useRef<HTMLSpanElement>(null);
  const statement4Ref = useRef<HTMLSpanElement>(null);
  const statement5Ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const root = rootRef.current;
    const statement1 = statement1Ref.current;
    const statement2 = statement2Ref.current;
    const statement3 = statement3Ref.current;
    const statement4 = statement4Ref.current;
    const statement5 = statement5Ref.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: '+=2000px',
        pin: true,
        pinSpacing: true,
        scrub: true,
        pinType: 'fixed',
      },
    });

    tl.to(statement1, { color: '#1A1C20', duration: 1 }, 0);
    tl.to(statement1, { color: '#1A1C20', duration: 1 }, 1);
    tl.to(statement1, { color: '#D1D3D8', duration: 1 }, 2);

    tl.to(statement2, { color: '#1A1C20', duration: 1 }, 2);
    tl.to(statement2, { color: '#1A1C20', duration: 1 }, 3);
    tl.to(statement2, { color: '#D1D3D8', duration: 1 }, 4);

    tl.to(statement3, { color: '#1A1C20', duration: 1 }, 4);
    tl.to(statement3, { color: '#1A1C20', duration: 1 }, 5);
    tl.to(statement3, { color: '#D1D3D8', duration: 1 }, 6);

    tl.to(statement4, { color: '#1A1C20', duration: 1 }, 6);
    tl.to(statement4, { color: '#1A1C20', duration: 1 }, 7);
    tl.to(statement4, { color: '#D1D3D8', duration: 1 }, 8);

    tl.to(statement5, { color: '#1A1C20', duration: 1 }, 8);
    tl.to(statement5, { color: '#1A1C20', duration: 1 }, 9);
    tl.to(statement5, { color: '#D1D3D8', duration: 1 }, 10);
  });

  return (
    <div ref={rootRef} className="flex w-full flex-col gap-[196px] bg-white pt-[176px] pb-[135px]">
      <Centered>
        <div className="w-full max-w-[1152px]">
          <div className="tablet:text-[24px] tablet:leading-[38px] mobile:text-[20px] mobile:leading-[30px] text-[28px] leading-[44px] font-bold tracking-[-0.6px] break-keep text-black">
            <span ref={statement1Ref} className="text-[#D1D3D8]">
              {sentences[0]}{' '}
            </span>
            <span ref={statement2Ref} className="text-[#D1D3D8]">
              {sentences[1]}{' '}
            </span>
            <span ref={statement3Ref} className="text-[#D1D3D8]">
              {sentences[2]}{' '}
            </span>
            <span ref={statement4Ref} className="text-[#D1D3D8]">
              {sentences[3]}{' '}
            </span>
            <span ref={statement5Ref} className="text-[#D1D3D8]">
              {sentences[4]}{' '}
            </span>
          </div>
        </div>
      </Centered>

      <div className="h-[504px] min-h-[504px]">
        <Marquee className="flex h-[504px] min-h-[504px]">
          <div className="ml-[18px] flex h-[504px] flex-row gap-4">
            {images.map((src, i) => {
              const alignClass =
                i % 3 === 0 ? 'self-end' : i % 3 === 1 ? 'self-center' : 'self-start';
              return (
                <div key={i} className={alignClass}>
                  <Image src={src} alt={`${i + 1}번째 카드 이미지`} width={269} height={391} />
                </div>
              );
            })}
          </div>
        </Marquee>
      </div>
    </div>
  );
}

export { PhilosophySection };
