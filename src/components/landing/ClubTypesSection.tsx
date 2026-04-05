import Image from 'next/image';
import { cn } from '@/lib/cn';
import { CLUB_TYPES } from '@/constants/landing/landing';

interface ClubTypesSectionProps {
  className?: string;
}

function ClubTypesSection({ className }: ClubTypesSectionProps) {
  return (
    <section
      className={cn(
        'tablet:gap-[50px] tablet:pt-[120px] tablet:pb-[120px] desktop:gap-[60px] desktop:pt-[203px] desktop:pb-[204px] flex w-full flex-col items-center gap-[40px] bg-[#FFFFFF] pt-[120px] pb-[137px]',
        className,
      )}
    >
      <div className="tablet:flex hidden flex-col gap-[14px] text-center text-[#1E2021]">
        <h2 className="tablet:text-[32px] tablet:leading-[40px] desktop:text-[48px] desktop:leading-[48px] text-center text-[24px] leading-[32px] font-extrabold tracking-[-0.005em]">
          활동이 달라도, 우리는 함께합니다
        </h2>
      </div>
      <div className="tablet:hidden flex flex-col gap-[14px] text-center text-[#1E2021]">
        <h2 className="tablet:text-[32px] tablet:leading-[40px] desktop:text-[40px] desktop:leading-[48px] text-center text-[32px] leading-[32px] font-extrabold tracking-[-0.005em]">
          활동이 달라도, <br />
          우리는 함께합니다
        </h2>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="desktop:hidden w-full overflow-hidden">
        <div className="animate-marquee flex">
          {[...CLUB_TYPES, ...CLUB_TYPES].map(({ label, image }, i) => (
            <div key={i} className="tablet:w-[348px] flex w-[174px] flex-shrink-0 flex-col">
              <span className="typo-sub2 text-text-alternative ml-[10px]">{label}</span>
              <div className="tablet:h-[501px] relative h-[220px] w-full">
                <Image src={image} alt={label} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="desktop:flex hidden w-full">
        {CLUB_TYPES.map(({ label, image }) => (
          <div key={label} className="flex flex-1 flex-col gap-[10px]">
            <span className="typo-sub2 text-text-alternative ml-[10px]">{label}</span>
            <div className="desktop:h-[501px] relative h-full w-full">
              <Image src={image} alt={label} fill className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      <div className="tablet:text-[20px] desktop:text-[24px] desktop:leading-[30px] px-600 text-center text-[18px] leading-[26px] font-semibold tracking-[-0.005em]">
        Weeth는 모든 동아리가 사용할 수 있는 환경을 지향합니다
      </div>
    </section>
  );
}

export { ClubTypesSection };
