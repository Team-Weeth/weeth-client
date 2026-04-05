'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Feature } from './ServiceSection';
import { LandingUserFaceIcon, LandingAdminFaceIcon } from '@/assets/icons/landing';

gsap.registerPlugin(ScrollTrigger);

const STEP_SCROLL = 1000;
const START_DELAY = 500;
const END_DELAY = 600;
const CARD_WIDTH = 1123;
const CARD_GAP = 22;

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
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const totalVirtualScroll = STEP_SCROLL * (features.length - 1);
  const totalTrackScroll = (CARD_WIDTH + CARD_GAP) * (features.length - 1);

  useGSAP(
    () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      ScrollTrigger.create({
        trigger: container,
        start: `top+=${START_DELAY} 64px`,
        end: `+=${STEP_SCROLL * (features.length - 1)}`,
        scrub: 0.6,
        snap: {
          snapTo: 1 / (features.length - 1),
          duration: { min: 0.4, max: 0.8 },
          ease: 'power2.out',
          delay: 0,
        },
        onUpdate: (self) => {
          const index = Math.round(self.progress * (features.length - 1));
          setActiveIndex(index);
          videoRefs.current.forEach((video, idx) => {
            if (!video) return;
            if (idx === index) video.play();
            else video.pause();
          });
        },
      });

      gsap.to(track, {
        x: -totalTrackScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: `top+=${START_DELAY} 64px`,
          end: `+=${STEP_SCROLL * (features.length - 1)}`,
          scrub: 1,
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
        <div className="-ml-[306px] w-screen overflow-hidden pl-[306px]">
          <div ref={trackRef} className="flex gap-[22px]">
            {features.map((f, i) => (
              <div key={f.chipLabel} className="w-[1123px] flex-shrink-0">
                <div
                  className={cn(
                    'h-[510px] w-full overflow-hidden rounded-[30px]',
                    f.video ? '' : cn('px-[93px] pt-[91px]', f.bgColor),
                  )}
                >
                  {f.video ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      src={f.video}
                      autoPlay={i === 0}
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : f.image ? (
                    <Image src={f.image} alt={f.chipLabel} width={945} height={523} />
                  ) : null}
                </div>
                <p className="mt-[22px] text-[18px] leading-[30px] font-semibold tracking-[-0.005em] text-[#909599]">
                  {f.highlightKeyword
                    ? (() => {
                        const idx = f.description.indexOf(f.highlightKeyword);
                        if (idx === -1) return f.description;
                        return (
                          <>
                            {f.description.slice(0, idx)}
                            <span className="text-[#000]">{f.highlightKeyword}</span>
                            {f.description.slice(idx + f.highlightKeyword.length)}
                          </>
                        );
                      })()
                    : f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export { ServiceSectionDesktop };
