import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { LandingGuideTitle } from '@/assets/icons/landing';
import { SETUP_GUIDE_STEPS } from '@/constants/landing';

interface SetupGuideSectionProps {
  className?: string;
}

function SetupGuideSection({ className }: SetupGuideSectionProps) {
  return (
    <section
      className={cn(
        'mx-auto w-full items-center justify-center bg-[#FFFFFF] pt-[172px] pb-[145px]',
        className,
      )}
    >
      <Image
        src={LandingGuideTitle}
        alt="LandingGuideTitle"
        width={508}
        height={148}
        className="mx-auto mb-[106px]"
      />

      <div className="mb-[66px] flex items-center justify-center gap-4">
        {SETUP_GUIDE_STEPS.map(({ number, title, description, bg }) => (
          <div
            key={number}
            className={cn(
              'flex h-[340px] w-[345px] rounded-[10px] pt-[29px] pr-[23px] pb-[37px] pl-[24px]',
              bg,
            )}
          >
            <div className="flex flex-col justify-between">
              <p className="text-[24px] leading-[30px] font-semibold tracking-[-0.005em] text-[#FFFFFF]">
                {title}
              </p>
              <p className="text-[16px] leading-[20px] font-semibold tracking-[-0.005em] text-[#FFFFFF] opacity-60">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/login"
        className="typo-button1 mx-auto block w-fit rounded-md bg-[#00C8AA] px-400 py-300 text-white hover:bg-[#A3FFE0] hover:text-[#1E2021]"
      >
        지금 무료로 시작하기
      </Link>
    </section>
  );
}

export { SetupGuideSection };
