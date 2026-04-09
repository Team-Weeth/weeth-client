import { Ldquo, LdquoBack, LeetsAvatar } from '@/assets/icons/landing';
import { cn } from '@/lib/cn';
import Image from 'next/image';

interface TestimonialSectionProps {
  className?: string;
}

function TestimonialSection({ className }: TestimonialSectionProps) {
  return (
    <section
      className={cn(
        'tablet:pt-[67px] tablet:pb-[137px] flex w-full items-center justify-center bg-[#508FFF] pt-[120px] pb-[52px]',
        className,
      )}
    >
      <div className="tablet:flex-row tablet:gap-[80px] tablet:justify-center desktop:gap-[173px] desktop:max-w-[1109px] tablet:mx-auto flex w-full flex-col items-center gap-[60px] px-600">
        <div className="tablet:w-[692px] flex flex-col gap-5">
          <Image
            src={Ldquo}
            alt="여는 따옴표"
            width={48}
            height={48}
            className="tablet:flex hidden self-start"
          />
          <Image
            src={Ldquo}
            alt="여는 따옴표"
            width={32}
            height={48}
            className="tablet:hidden flex self-start"
          />
          <div className="tablet:flex hidden text-[32px] leading-[160%] font-bold tracking-[-0.005em] text-[#FFFFFF]">
            Weeth는 우리 동아리가 나아가야할 방향을 제시하는 데 큰 도움이 되었어요. 동아리의 열정이
            이어질 수 있는 공간이에요.
          </div>
          <div className="tablet:hidden flex text-[20px] leading-[160%] font-bold tracking-[-0.005em] text-[#FFFFFF]">
            Weeth는 우리 동아리가 나아가야할 방향을 제시하는 데 큰 도움이 되었어요. 동아리의 열정이
            이어질 수 있는 공간이에요.
          </div>
          <Image
            src={LdquoBack}
            alt="닫는 따옴표"
            width={48}
            height={48}
            className="tablet:flex hidden self-end"
          />
          <Image
            src={LdquoBack}
            alt="닫는 따옴표"
            width={32}
            height={48}
            className="tablet:hidden flex self-end"
          />
        </div>

        <div className="tablet:self-auto flex shrink-0 items-center gap-100 self-start">
          <Image
            src={LeetsAvatar}
            alt="Leets Avatar"
            width={49}
            height={49}
            className="mr-[21px] rounded-full"
          />
          <p className="typo-h3 mr-[14px] text-white">노정완</p>
          <div className="flex flex-col gap-1">
            <p className="typo-caption1 text-white">가천대학교 IT 동아리 Leets</p>
            <p className="typo-caption2 text-white">전) Head Leader</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { TestimonialSection };
