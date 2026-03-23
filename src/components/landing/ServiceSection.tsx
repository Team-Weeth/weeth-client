'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { cn } from '@/lib/cn';
import { LandingUserFaceIcon, LandingAdminFaceIcon } from '@/assets/icons/landing';

interface Feature {
  chipLabel: string;
  cardTitle: string;
  description: string;
  bgColor: string;
  image: StaticImageData;
}

interface ServiceSectionProps {
  className?: string;
  variant: 'user' | 'admin';
  title: string;
  subtitle: string;
  serviceLabel: string;
  features: Feature[];
}

function ServiceSection({
  className,
  variant,
  title,
  subtitle,
  serviceLabel,
  features,
}: ServiceSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 1123;
  const CARD_GAP = 22;

  const handleChipClick = (i: number) => {
    setActiveIndex(i);
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ left: (CARD_WIDTH + CARD_GAP) * i, behavior: 'smooth' });
    }
  };

  return (
    <section
      className={cn(
        'w-full pt-[86px] pb-[180px] pl-[306px]',
        variant === 'user' ? 'bg-[#F3F5F7]' : 'bg-[#E6EAED]',
        className,
      )}
    >
      <div className="mb-400 flex items-center gap-200">
        <span className={cn('typo-sub2 flex items-center gap-[13px] text-[#1E2021]')}>
          <Image
            src={variant === 'user' ? LandingUserFaceIcon : LandingAdminFaceIcon}
            alt="face-icon"
            width={24}
            height={24}
          />
          {serviceLabel}
        </span>
      </div>

      <h2 className="mt-[54px] mb-300 text-[48px] font-bold whitespace-pre-line text-[#1E2021]">
        {title}
      </h2>
      <div className="mt-[48px] mb-[102px] flex w-[1123px] justify-between">
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

      <div
        ref={scrollRef}
        className="-ml-[306px] flex w-screen snap-x snap-mandatory [scroll-padding-left:306px] gap-[22px] overflow-x-auto pr-[calc(100vw-1306px)] pl-[306px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {features.map((f) => (
          <div key={f.chipLabel} className="w-[1123px] flex-shrink-0 snap-start">
            <div
              className={cn(
                'h-[510px] w-full overflow-hidden rounded-[30px] px-[93px] pt-[91px]',
                f.bgColor,
              )}
            >
              <Image src={f.image} alt={f.chipLabel} width={945} height={523} />
            </div>
            <p className="mt-[22px] text-[24px] leading-[30px] font-semibold tracking-[-0.005em] text-[#1E2021]">
              {f.cardTitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ServiceSection };
export type { Feature };
