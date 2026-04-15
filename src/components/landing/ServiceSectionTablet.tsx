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

const STEP_SCROLL = 1000;
const END_DELAY = 500;
const FIRST_CHIP_OFFSET = 1;

interface ServiceSectionTabletProps {
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

function ServiceSectionTablet({
  className,
  variant,
  title,
  subtitle,
  serviceLabel,
  features,
}: ServiceSectionTabletProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoReady, setVideoReady] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionActiveRef = useRef(false);
  const contentTriggerRef = useRef<ScrollTrigger | null>(null);
  const syncActiveVideoRef = useRef<(index: number, reset?: boolean) => void>(() => {});

  const markVideoReady = (index: number) => {
    setVideoReady((prev) => {
      if (prev.has(index)) return prev;
      return new Set(prev).add(index);
    });
  };

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || features.length <= 1) return;

      const pauseAllVideos = () => {
        videoRefs.current.forEach((video) => video?.pause());
      };

      const syncActiveVideo = (index: number, reset = false) => {
        setActiveIndex(index);
        videoRefs.current.forEach((video, idx) => {
          if (!video) return;
          if (idx === index) {
            if (reset) video.currentTime = 0;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      };
      syncActiveVideoRef.current = syncActiveVideo;

      const contentTrigger = ScrollTrigger.create({
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
          syncActiveVideo(index);
        },
        onRefresh: (self) => {
          const index = Math.round(self.progress * (features.length - 1));
          syncActiveVideo(index);
        },
      });
      contentTriggerRef.current = contentTrigger;

      ScrollTrigger.create({
        trigger: container,
        start: 'top 64px',
        end: 'bottom 64px',
        onEnter: () => {
          sectionActiveRef.current = true;
          syncActiveVideo(Math.round(contentTrigger.progress * (features.length - 1)), true);
        },
        onEnterBack: () => {
          sectionActiveRef.current = true;
          syncActiveVideo(Math.round(contentTrigger.progress * (features.length - 1)), true);
        },
        onLeave: () => {
          sectionActiveRef.current = false;
          pauseAllVideos();
        },
        onLeaveBack: () => {
          sectionActiveRef.current = false;
          pauseAllVideos();
        },
      });
    },
    { dependencies: [], revertOnUpdate: true },
  );

  const handleChipClick = (i: number) => {
    const trigger = contentTriggerRef.current;
    if (!trigger) return;
    sectionActiveRef.current = true;
    const progress = features.length > 1 ? i / (features.length - 1) : 0;
    const targetScroll = trigger.start + (trigger.end - trigger.start) * progress;
    window.scrollTo({
      top: i === 0 ? targetScroll + FIRST_CHIP_OFFSET : targetScroll,
      behavior: 'auto',
    });
    window.requestAnimationFrame(() => {
      sectionActiveRef.current = true;
      syncActiveVideoRef.current(i, true);
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
          'sticky top-[64px] flex w-full flex-col',
          variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#ffffff]',
        )}
      >
        <div className="mx-auto flex w-full max-w-[1300px] flex-col px-600">
          <div className="flex shrink-0 items-center gap-200">
            <span className="typo-sub3 mt-[16px] flex items-center gap-[13px] text-[#1E2021]">
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

          <div className="mt-[clamp(20px,3vh,48px)] mb-[clamp(24px,5vh,86px)] flex w-full shrink-0 items-start justify-between">
            <p className="text-[18px] leading-[24px] font-semibold text-[#888A8C]">
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
                    'h-[40px] min-w-[40px] cursor-pointer rounded-3xl px-[15px] py-2 text-[14px] leading-[20px] font-semibold tracking-[-0.005em] transition-colors',
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
                        'h-[clamp(180px,30vh,520px)] overflow-hidden rounded-[30px] px-[24px] pt-[24px]',
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
                        if (!el) return;
                        if (el.readyState >= 2) markVideoReady(activeIndex);
                        if (sectionActiveRef.current) el.play().catch(() => {});
                      }}
                      src={active.video}
                      onLoadedData={() => markVideoReady(activeIndex)}
                      onCanPlay={() => markVideoReady(activeIndex)}
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
        </div>
      </section>
    </div>
  );
}

export { ServiceSectionTablet };
