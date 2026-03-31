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
        'flex w-full flex-col items-center gap-[60px] bg-[#FFFFFF] pt-[203px] pb-[204px]',
        className,
      )}
    >
      <div className="flex flex-col gap-[14px] text-center text-[#1E2021]">
        <h2 className="text-center text-[40px] leading-[48px] font-extrabold tracking-[-0.005em]">
          활동이 달라도, 우리는 함께합니다
        </h2>
      </div>

      <div className="flex w-full">
        {CLUB_TYPES.map(({ label, image }) => (
          <div key={label} className="flex flex-1 flex-col gap-[15px]">
            <span className="typo-sub2 text-text-alternative ml-[10px]">{label}</span>
            <div className="relative h-[501px] w-full">
              <Image src={image} alt={label} fill className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-[24px] leading-[30px] font-semibold tracking-[-0.005em]">
        Weeth는 모든 동아리가 사용할 수 있는 환경을 지향합니다
      </div>
    </section>
  );
}

export { ClubTypesSection };
