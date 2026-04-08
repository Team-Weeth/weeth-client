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
import { Skeleton } from '@/components/ui';

gsap.registerPlugin(ScrollTrigger);

const STEP_SCROLL = 800;
const END_DELAY = 500;

interface ServiceSectionMobileProps {
  className?: string;
  variant: 'user' | 'admin';
  title: string;
  subtitle: string;
  serviceLabel: string;
  features: Feature[];
}

function renderDescription(f: Feature) {
  if (!f.highlightKeyword) return f.description;
  const idx = f.description.indexOf(f.highlightKeyword);
  if (idx === -1) return f.description;
  return (
    <>
      {f.description.slice(0, idx)}
      <span className="text-[#000]">{f.highlightKeyword}</span>
      {f.description.slice(idx + f.highlightKeyword.length)}
    </>
  );
}

function ServiceSectionMobile({
  className,
  variant,
  title,
  subtitle,
  serviceLabel,
  features,
}: ServiceSectionMobileProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoReady, setVideoReady] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || features.length <= 1) return;

      ScrollTrigger.create({
        trigger: container,
        start: 'top 64px',
        end: `+=${STEP_SCROLL * (features.length - 1)}`,
        scrub: 0.6,
        snap: {
          snapTo: (value) => {
            const step = 1 / (features.length - 1);
            return Math.round(value / step) * step;
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
    window.scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * progress,
      behavior: 'instant',
    });
  };

  const active = features[activeIndex];

  return (
    <div
      ref={containerRef}
      style={{
        height: `calc(100vh + ${STEP_SCROLL * (features.length - 1) + END_DELAY}px)`,
      }}
      className={cn(variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#ffffff]', className)}
    >
      <section
        className={cn(
          'sticky top-[64px] flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-600 pt-[20px]',
          variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#ffffff]',
        )}
      >
        <div className="flex shrink-0 items-center gap-200">
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

        <h2 className="mt-[clamp(20px,3vh,54px)] shrink-0 text-[32px] leading-[130%] font-extrabold tracking-[-0.005em] whitespace-pre-line text-[#1E2021]">
          {title}
        </h2>

        <div className="mt-[clamp(24px,3vh,48px)] mb-[clamp(24px,5vh,86px)] flex w-full shrink-0 flex-col gap-[64px]">
          <p className="text-[14px] leading-[18px] font-semibold text-[#888A8C]">
            {subtitle.split('<br/>').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
          <div className="flex shrink-0 gap-1">
            {features.map((f, i) => (
              <button
                key={f.chipLabel}
                onClick={() => handleChipClick(i)}
                className={cn(
                  'h-[40px] min-w-[30px] cursor-pointer rounded-3xl px-[15px] py-2 text-[12px] leading-[20px] font-semibold tracking-[-0.005em] transition-colors',
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
            className="w-full"
          >
            <div
              className={cn(
                'w-full',
                active.video
                  ? ''
                  : cn(
                      'h-[clamp(150px,28vh,280px)] overflow-hidden rounded-[30px] px-[24px] pt-[24px]',
                      active.bgColor,
                    ),
              )}
            >
              {active.video ? (
                <div className="relative w-full">
                  {!videoReady.has(activeIndex) ? (
                    <Skeleton className="aspect-[3840/1888] w-full animate-pulse rounded-[30px] bg-[#E6EAED]" />
                  ) : null}
                  <video
                    ref={(el) => {
                      videoRefs.current[activeIndex] = el;
                    }}
                    src={active.video}
                    onLoadedData={() => setVideoReady((prev) => new Set(prev).add(activeIndex))}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className={cn(
                      'h-auto w-full rounded-[30px]',
                      !videoReady.has(activeIndex) && 'invisible absolute',
                    )}
                  />
                </div>
              ) : active.image ? (
                <Image src={active.image} alt={active.chipLabel} width={945} height={523} />
              ) : null}
            </div>
            <p className="mt-[16px] pb-[clamp(16px,3vh,32px)] text-[15px] leading-[24px] font-semibold tracking-[-0.005em] text-[#909599]">
              {renderDescription(active)}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

export { ServiceSectionMobile };
