// 'use client';

// import Link from 'next/link';
// import { useRef } from 'react';
// import { useGSAP } from '@gsap/react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// interface CTASectionProps {
//   className?: string;
// }

// function CTASection({ className }: CTASectionProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const cardRef = useRef<HTMLDivElement>(null);

//   useGSAP(
//     () => {
//       const container = containerRef.current;
//       const card = cardRef.current;
//       if (!container || !card) return;

//       // 1. 초기 스타일을 확실히 잡아줍니다.
//       gsap.set(card, { width: '100%', maxWidth: '100vw' });

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: container,
//           start: 'top top', // 컨테이너 상단이 화면 상단에 닿을 때 딱 고정
//           end: '+=1500', // 1500px 동안 고정 (이 수치를 조절해서 속도 결정)
//           scrub: 1, // 스크롤에 따라 부드럽게 반응
//           pin: true, // 이 요소 전체를 고정
//           pinSpacing: true, // 아래 빈 공간 생성 (정상)
//           onUpdate: (self) => {
//             // 디버깅용: 스크롤 진행도를 콘솔에서 확인 가능 (0 ~ 1)
//             // console.log(self.progress);
//           },
//         },
//       });

//       tl.to(card, {
//         width: '1122px', // 목표 너비
//         height: '499px', // 목표 높이
//         borderRadius: '40px',
//         ease: 'power1.inOut',
//       });
//     },
//     { scope: containerRef },
//   );

//   return (
//     <div ref={containerRef} className={className}>
//       <section className="flex min-h-screen w-full items-center justify-center bg-[#00C8AA]">
//         <div
//           ref={cardRef}
//           className="mx-[18px] flex h-[753px] w-full flex-col items-center justify-center overflow-hidden rounded-[40px] bg-white"
//           style={{ borderRadius: '40px' }}
//         >
//           <h2 className="mb-[14px] text-center text-[64px] leading-[130%] font-bold tracking-[-0.005em] text-[#1E2021]">
//             함께하는 순간이
//             <br />더 오래 이어지도록
//           </h2>
//           <p className="mb-[63px] text-center text-[16px] leading-[24px] font-semibold tracking-[-0.005em] text-black">
//             동아리 정보를 입력하고,
//             <br />
//             3분 만에 사이트를 개설해보세요.
//           </p>
//           <div className="flex gap-3">
//             <Link
//               href="/login"
//               className="typo-button1 block w-fit rounded-md bg-[#00C8AA] px-400 py-300 text-white hover:bg-[#00877a]"
//             >
//               지금 무료로 시작하기
//             </Link>
//             <Link
//               href="/contact"
//               className="typo-button1 block w-fit rounded-md bg-[#E6EAED] px-400 py-300 text-black hover:bg-[#b7bcbf]"
//             >
//               가입 문의
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export { CTASection };

// 'use client';

// // media.ts (또는 그냥 인라인으로 사용)
// export function media(when: 'base' | 'medium' | 'small', grow?: boolean) {
//   const base = 'hidden';
//   const growClass = grow ? 'flex-1' : '';

//   const display = {
//     base: 'lg:block', // min-width: 1025px
//     medium: 'max-lg:block', // max-width: 1024px
//     small: 'max-sm:block', // max-width: 640px
//   }[when];

//   return [base, display, growClass].filter(Boolean).join(' ');
// }

// // 상수 (기존과 동일하게 유지)
// const outerTitleContainerClass =
//   'absolute top-0 left-0 w-screen pt-[178px] box-border max-lg:pt-[128px] max-sm:pt-[118px] max-sm:whitespace-pre-wrap';

// const outerTitleClass =
//   'text-[64px] leading-[84px] font-bold font-["Karrot_Sans",sans-serif] break-keep max-lg:text-[52px] max-lg:leading-[74px] max-lg:text-center max-sm:text-[36px] max-sm:leading-[52px] max-sm:text-center';

// function innerTitle({
//   position,
//   hidden,
//   whiteSpace,
// }: {
//   position?: 'absolute';
//   hidden?: boolean;
//   whiteSpace?: 'preWrap';
// }) {
//   return cn(
//     // base (outerTitle + 추가)
//     outerTitleClass,
//     'text-white w-full',
//     // variants
//     position === 'absolute' && 'absolute top-0 left-0',
//     hidden && 'opacity-0',
//     whiteSpace === 'preWrap' && 'whitespace-pre-wrap',
//   );
// }

// media.base = '(min-width: 1025px)';
// media.medium = '(max-width: 1024px)';
// media.small = '(max-width: 640px)';

// export const SIDE_MARGIN = 24;

// export const MAX_WIDTH = 1200 - SIDE_MARGIN * 2;

// export const GNB_HEIGHT = 68;

// export const FIRST_FOLD_STORY_HEIGHT = 1000;

// export const TITLE_MAX_HEIGHT = 168;
// export const CARD_BORDER_RADIUS = 30;
// export const CARD_TEXT_BOTTOM_PADDING = 24;

// import { useRef } from 'react';
// import { useGSAP } from '@gsap/react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useWindowSize } from 'react-use';
// import Image from 'next/image';
// import { cn } from '@/lib/cn';

// gsap.registerPlugin(ScrollTrigger);
// const mm = gsap.matchMedia();

// function CTASection() {
//   const { width: windowWidth, height: windowHeight } = useWindowSize();
//   const STORY_TITLE_OFFSET = 24;

//   /**
//    * Refs
//    */
//   const containerRef = useRef<HTMLDivElement>(null);
//   const innerTitleContainerRef = useRef<HTMLDivElement>(null);
//   const innerTitle1Ref = useRef<HTMLHeadingElement>(null);
//   const innerTitle2Ref = useRef<HTMLHeadingElement>(null);
//   const cardRef = useRef<HTMLDivElement>(null);

//   useGSAP(
//     () => {
//       const container = containerRef.current;
//       const innerTitleContainer = innerTitleContainerRef.current;
//       const innerTitle1 = innerTitle1Ref.current;
//       const innerTitle2 = innerTitle2Ref.current;
//       const card = cardRef.current;

//       const cardSidePadding =
//         windowWidth > MAX_WIDTH + SIDE_MARGIN * 2 ? (windowWidth - MAX_WIDTH) / 2 : SIDE_MARGIN;

//       const tl = gsap.timeline({
//         scrollTrigger: {
//           trigger: container,
//           start: 'top top',
//           end: `+=${FIRST_FOLD_STORY_HEIGHT}px`,
//           pin: true,
//           scrub: true,
//           pinType: 'fixed',
//         },
//       });

//       mm.add(media.base, () => {
//         const cardInactiveStyle = {
//           opacity: 1,
//           clipPath: `inset(322px ${cardSidePadding}px -${CARD_BORDER_RADIUS}px ${cardSidePadding}px round ${CARD_BORDER_RADIUS}px)`,
//         };
//         const cardActiveStyle = {
//           clipPath: 'inset(0px 0px 0px 0px round 0px)',
//           ease: 'none',
//           duration: 1,
//         };

//         tl.fromTo(card, cardInactiveStyle, cardActiveStyle);
//         tl.to(card, {}, 1);
//       });
//       mm.add(media.medium, () => {
//         const cardInactiveStyle = {
//           opacity: 1,
//           clipPath: `inset(250px ${cardSidePadding}px -${CARD_BORDER_RADIUS}px ${cardSidePadding}px round ${CARD_BORDER_RADIUS}px)`,
//         };
//         const cardActiveStyle = {
//           clipPath: 'inset(0px 0px 0px 0px round 0px)',
//           ease: 'none',
//           duration: 1,
//         };

//         tl.fromTo(card, cardInactiveStyle, cardActiveStyle);
//         tl.to(card, {}, 1);
//       });

//       const textExitStyle = {
//         opacity: 0,
//         transform: `translateY(-${STORY_TITLE_OFFSET}px)`,
//         duration: 0.5,
//         ease: 'none',
//       };
//       const textEnterStyle = {
//         opacity: 0,
//         transform: `translateY(${STORY_TITLE_OFFSET}px)`,
//         duration: 0.5,
//         ease: 'none',
//       };
//       const textActiveStyle = {
//         opacity: 1,
//         transform: 'translateY(0px)',
//         duration: 1,
//       };

//       tl.to(innerTitle1, textExitStyle, 0.5);
//       tl.fromTo(innerTitle2, textEnterStyle, textActiveStyle, 0.75);

//       const innerTitleContainerEnd = windowHeight - (innerTitleContainer?.offsetHeight ?? 0) - 80;

//       gsap.timeline({
//         scrollTrigger: {
//           trigger: innerTitleContainer,
//           start: `top -=${FIRST_FOLD_STORY_HEIGHT}px`,
//           end: `+=${innerTitleContainerEnd}px`,
//           pin: true,
//           scrub: true,
//           pinType: 'transform',
//         },
//       });
//     },
//     {
//       scope: cardRef,
//       dependencies: [windowWidth, windowHeight],
//       revertOnUpdate: true,
//     },
//   );

//   return (
//     <>
//       <div className="absolute top-0 left-0 h-screen w-screen overflow-hidden" ref={containerRef}>
//         <div ref={cardRef} className="absolute top-0 left-0 h-screen w-screen opacity-0">
//           <Image
//             className="h-full w-full object-cover"
//             src="/public/assets/favicon/favicon.svg"
//             alt="dd"
//             width={1692}
//             height={753}
//           />
//           <div
//             ref={innerTitleContainerRef}
//             className="bsolute top-0 left-0 box-border w-screen pt-[178px] max-lg:pt-[128px] max-sm:pt-[118px] max-sm:whitespace-pre-wrap"
//           >
//             <div className="relative">
//               <div
//                 ref={innerTitle1Ref}
//                 className={innerTitle({ position: 'absolute' })}
//                 style={{ position: 'absolute', top: 0, left: 0 }}
//               >
//                 첫번ㅂ째문장
//               </div>
//               <div
//                 className={innerTitle({
//                   hidden: true,
//                   position: 'absolute',
//                   whiteSpace: 'preWrap',
//                 })}
//               >
//                 2문장
//               </div>
//               <div
//                 ref={innerTitle2Ref}
//                 className={innerTitle({
//                   whiteSpace: 'preWrap',
//                 })}
//               >
//                 막문장
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div style={{ height: `calc(${FIRST_FOLD_STORY_HEIGHT}px + 100vh)` }} />
//     </>
//   );
// }

// export { CTASection };

'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useWindowSize } from 'react-use';

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
            <Link
              href="/login"
              className="typo-button1 block w-fit rounded-md bg-[#00C8AA] px-400 py-300 text-white hover:bg-[#00877a]"
            >
              지금 무료로 시작하기
            </Link>
            <Link
              href="/contact"
              className="typo-button1 block w-fit rounded-md bg-[#E6EAED] px-400 py-300 text-black hover:bg-[#b7bcbf]"
            >
              가입 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export { CTASection };
