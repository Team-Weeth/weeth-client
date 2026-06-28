'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import type { Feature } from './ServiceSection';
import { Skeleton } from '../ui';

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
  features,
}: ServiceSectionDesktopProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState<Set<number>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionActiveRef = useRef(false);
  const contentTriggerRef = useRef<ScrollTrigger | null>(null);
  const syncActiveVideoRef = useRef<(index: number, reset?: boolean) => void>(() => {});

  const totalVirtualScroll = STEP_SCROLL * (features.length - 1);

  const markVideoReady = (index: number) => {
    setVideoReady((prev) => {
      if (prev.has(index)) return prev;
      return new Set(prev).add(index);
    });
  };

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

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
        start: `top+=${START_DELAY} 64px`,
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
    syncActiveVideoRef.current(i, true);
    const progress = features.length > 1 ? i / (features.length - 1) : 0;
    const targetScroll = trigger.start + (trigger.end - trigger.start) * progress;
    window.scrollTo({ top: targetScroll, behavior: 'instant' });
  };

  const active = features[activeIndex];

  return (
    <div
      ref={containerRef}
      style={{ height: `calc(100vh + ${totalVirtualScroll + START_DELAY + END_DELAY}px)` }}
      className={cn(variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#FFFFFF]', className)}
    >
      <section
        className={cn(
          'sticky top-[64px] flex w-full flex-col',
          variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#FFFFFF]',
        )}
      >
        <div className="mx-auto flex w-full max-w-[1123px] flex-col gap-[clamp(40px,6vh,80px)]">
          {/* <div className="flex shrink-0 items-center gap-200">
            <span className="typo-sub3 flex items-center gap-[13px] text-[#1E2021]">
              <Image
                src={variant === 'user' ? LandingUserFaceIcon : LandingAdminFaceIcon}
                alt="face-icon"
                width={24}
                height={24}
              />
              {serviceLabel}
            </span>
          </div> */}

          {/* <h2 className="mt-[clamp(20px,3vh,54px)] shrink-0 text-[48px] leading-[130%] font-extrabold tracking-[-0.005em] whitespace-pre-line text-[#1E2021]">
            {title}
          </h2> */}

          <div className="flex w-full shrink-0 justify-between">
            {/* <p className="desktop:text-[24px] desktop:leading-[32px] text-[16px] leading-[24px] font-semibold tracking-[-0.005em] text-[#8E8F90]">
              {subtitle.split('<br/>').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </p> */}
            <h2 className="mt-[clamp(20px,3vh,54px)] shrink-0 text-[48px] leading-[130%] font-extrabold tracking-[-0.005em] whitespace-pre-line text-[#1E2021]">
              {title}
            </h2>
            <div className="flex items-end gap-2">
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
              className="w-full"
            >
              <div
                className={cn(
                  'w-full',
                  active.video
                    ? ''
                    : cn('items-start overflow-hidden rounded-[30px] pt-[91px]', active.bgColor),
                )}
              >
                {active.video ? (
                  <div className="relative aspect-[3840/1888] w-full overflow-hidden rounded-[30px]">
                    {!videoReady.has(activeIndex) && (
                      <Skeleton className="absolute inset-0 animate-pulse rounded-[30px] bg-[#E6EAED]" />
                    )}
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
                      preload="none"
                      className={cn(
                        'w-full rounded-[30px]',
                        !videoReady.has(activeIndex) && 'invisible',
                      )}
                    />
                  </div>
                ) : active.image ? (
                  <Image src={active.image} alt={active.chipLabel} width={945} height={523} />
                ) : null}
              </div>
              <p className="mt-[22px] pb-[clamp(16px,3vh,32px)] text-[18px] leading-[30px] font-semibold tracking-[-0.005em] text-[#909599]">
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
        </div>
      </section>
    </div>
  );
}

export { ServiceSectionDesktop };
