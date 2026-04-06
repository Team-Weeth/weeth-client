'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import type { Feature } from './ServiceSection';
import { LandingUserFaceIcon, LandingAdminFaceIcon } from '@/assets/icons/landing';

gsap.registerPlugin(ScrollTrigger);

const STEP_SCROLL = 1500;
const START_DELAY = 500;
const END_DELAY = 600;

interface ServiceSectionDesktopProps {
  className?: string;
  variant: 'user' | 'admin';
  title: string;
  subtitle: string;
  serviceLabel: string;
  features: Feature[];
}

function ServiceSectionDesktop({
  className,
  variant,
  title,
  subtitle,
  serviceLabel,
  features,
}: ServiceSectionDesktopProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const totalVirtualScroll = STEP_SCROLL * (features.length - 1);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      ScrollTrigger.create({
        trigger: container,
        start: `top+=${START_DELAY} 64px`,
        end: `+=${STEP_SCROLL * (features.length - 1)}`,
        scrub: 0.6,
        snap: {
          snapTo: (value, self) => {
            const step = 1 / (features.length - 1);
            const currentSnap = Math.round((self?.progress ?? 0) / step) * step;
            if (Math.abs(value - currentSnap) < step * 0.01) return currentSnap;
            const direction = value > currentSnap ? 1 : -1;
            return Math.max(0, Math.min(1, currentSnap + direction * step));
          },
          duration: { min: 0.4, max: 0.8 },
          ease: 'power2.out',
          delay: 0,
        },
        onUpdate: (self) => {
          const index = Math.round(self.progress * (features.length - 1));
          setActiveIndex(index);
          videoRefs.current.forEach((video, idx) => {
            if (!video) return;
            if (idx === index) video.play().catch(() => {});
            else video.pause();
          });
        },
      });
    },
    { dependencies: [], revertOnUpdate: true },
  );

  const handleChipClick = (i: number) => {
    const container = containerRef.current;
    if (!container) return;
    const trigger = ScrollTrigger.getAll().find((t) => t.trigger === container);
    if (!trigger) return;
    const progress = features.length > 1 ? i / (features.length - 1) : 0;
    const targetScroll = trigger.start + (trigger.end - trigger.start) * progress;
    window.scrollTo({ top: targetScroll, behavior: 'instant' });
  };

  const active = features[activeIndex];

  return (
    <div
      ref={containerRef}
      style={{ height: `calc(100vh + ${totalVirtualScroll + START_DELAY + END_DELAY}px)` }}
      className={className}
    >
      <section
        className={cn(
          'sticky top-[64px] h-[calc(100vh-64px)] w-full overflow-hidden pt-[clamp(40px,5vh,86px)] pl-[306px]',
          variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#E6EAED]',
        )}
      >
        <div className="mb-400 flex items-center gap-200">
          <span className="typo-sub2 flex items-center gap-[13px] text-[#1E2021]">
            <Image
              src={variant === 'user' ? LandingUserFaceIcon : LandingAdminFaceIcon}
              alt="face-icon"
              width={24}
              height={24}
            />
            {serviceLabel}
          </span>
        </div>

        <h2 className="mt-[clamp(20px,3vh,54px)] mb-300 text-[48px] font-bold whitespace-pre-line text-[#1E2021]">
          {title}
        </h2>

        <div className="mt-[clamp(20px,3vh,48px)] mb-[clamp(40px,5vh,86px)] flex w-[1123px] justify-between">
          <p className="typo-body1 text-[#1E2021]">
            {subtitle.split('<br/>').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className="flex gap-2">
            {features.map((f, i) => (
              <button
                key={f.chipLabel}
                onClick={() => handleChipClick(i)}
                className={cn(
                  'typo-button2 h-[40px] min-w-[40px] cursor-pointer rounded-3xl px-[15px] py-2 transition-colors',
                  i === activeIndex
                    ? 'bg-[#00C8AA] text-white hover:bg-[#00b89c]'
                    : 'border border-[#00C8AA] text-[#00C8AA] hover:bg-[#00C8AA] hover:text-white',
                )}
              >
                {f.chipLabel}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[1123px]"
          >
            <div
              className={cn(
                'h-[510px] w-full overflow-hidden rounded-[30px]',
                active.video ? '' : cn('px-[93px] pt-[91px]', active.bgColor),
              )}
            >
              {active.video ? (
                <video
                  ref={(el) => {
                    videoRefs.current[activeIndex] = el;
                  }}
                  src={active.video}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : active.image ? (
                <Image src={active.image} alt={active.chipLabel} width={945} height={523} />
              ) : null}
            </div>
            <p className="mt-[22px] text-[18px] leading-[30px] font-semibold tracking-[-0.005em] text-[#909599]">
              {active.highlightKeyword
                ? (() => {
                    const idx = active.description.indexOf(active.highlightKeyword);
                    if (idx === -1) return active.description;
                    return (
                      <>
                        {active.description.slice(0, idx)}
                        <span className="text-[#000]">{active.highlightKeyword}</span>
                        {active.description.slice(idx + active.highlightKeyword.length)}
                      </>
                    );
                  })()
                : active.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

export { ServiceSectionDesktop };
