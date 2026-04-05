'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import type { Feature } from './ServiceSection';
import { ServiceSectionHeader } from './ServiceSectionHeader';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || features.length <= 1) return;

      ScrollTrigger.create({
        trigger: container,
        start: `top 64px`,
        end: `+=${STEP_SCROLL * (features.length - 1)}`,
        scrub: 0.6,
        snap: {
          snapTo: 1 / (features.length - 1),
          duration: { min: 0.3, max: 0.6 },
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

  const chips = (
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
  );

  return (
    <div
      ref={containerRef}
      style={{
        height: `calc(100vh + ${STEP_SCROLL * (features.length - 1) + END_DELAY}px)`,
      }}
      className={cn(variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#E6EAED]', className)}
    >
      <section
        className={cn(
          'tablet:pt-[56px] sticky top-[64px] h-[calc(100vh-64px)] w-full overflow-hidden px-600 pt-[20px] pb-[48px]',
          variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#E6EAED]',
        )}
      >
        <ServiceSectionHeader
          variant={variant}
          serviceLabel={serviceLabel}
          title={title}
          subtitle={subtitle}
          chips={chips}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div
              className={cn(
                'tablet:rounded-[8px] w-full overflow-hidden rounded-[8px]',
                active.video
                  ? ''
                  : cn('tablet:h-[420px] h-[280px] px-[24px] pt-[24px]', active.bgColor),
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
                  className="h-auto w-full"
                />
              ) : active.image ? (
                <Image src={active.image} alt={active.chipLabel} width={945} height={523} />
              ) : null}
            </div>
            <p className="mt-[16px] text-[15px] leading-[24px] font-semibold tracking-[-0.005em] text-[#909599]">
              {renderDescription(active)}
            </p>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

export { ServiceSectionMobile };
