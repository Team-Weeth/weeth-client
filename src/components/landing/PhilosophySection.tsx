'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/cn';

gsap.registerPlugin(ScrollTrigger);

const sentences = [
  '동아리를 운영하다 보면 세션 준비와 출석 관리, 공지 정리에 많은 시간을 쓰게 됩니다.',
  '그러다 보면 정작 동아리원과 함께 웃고 이야기할 시간은 조금씩 줄어들기도 합니다.',
  '우리는 운영이 사람보다 앞서지 않았으면 했습니다.',
  '동아리원이 중심이 되는 구조, 그 시간을 다시 사람에게 돌려주는 방식.',
  'Weeth는 그 고민을 해결해나가고 있습니다.',
];

const galleryColors = [
  'bg-brand-primary',
  'bg-brand-secondary',
  'bg-container-neutral-interaction',
  'bg-container-primary-alternative',
  'bg-container-secondary-alternative',
  'bg-brand-purple',
];

function PhilosophySection() {
  const pinRef = useRef<HTMLDivElement>(null);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const spans = spanRefs.current.filter(Boolean) as HTMLSpanElement[];

      spans.forEach((span) => gsap.set(span, { color: '#B0B0B0' }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: `+=${spans.length * 500}`,
          pin: true,
          scrub: true,
          snap: {
            snapTo: 1 / spans.length,
            duration: { min: 0.3, max: 0.5 },
            ease: 'linear',
          },
        },
      });

      spans.forEach((span) => {
        tl.to(span, { color: '#434343', duration: 1, ease: 'steps(1)' });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full bg-white">
      <div ref={pinRef}>
        <div className="flex w-full items-center justify-center px-[160px] pt-[176px] pb-[104px]">
          <p className="max-w-[1119px] font-[family-name:var(--font-inter)] text-[24px] leading-[160%] font-bold tracking-[-0.5%] text-[#B0B0B0]">
            {sentences.map((sentence, i) => (
              <span
                key={i}
                ref={(el) => {
                  spanRefs.current[i] = el;
                }}
              >
                {sentence}{' '}
              </span>
            ))}
          </p>
        </div>

        <div className="h-[92px]" />
        <div className="h-[505px] overflow-hidden">
          <div className="flex h-full animate-[gallery-scroll_30s_linear_infinite] items-center gap-[14px] pl-[18px]">
            {[...galleryColors, ...galleryColors].map((color, i) => (
              <div
                key={i}
                className={cn(
                  'h-[391px] w-[269px] flex-shrink-0',
                  color,
                  i % 3 === 0 && 'self-center',
                  i % 3 === 1 && 'self-start',
                  i % 3 === 2 && 'self-end',
                )}
              />
            ))}
          </div>
        </div>
        <div className="h-[135px]" />
      </div>
    </section>
  );
}

export { PhilosophySection };
