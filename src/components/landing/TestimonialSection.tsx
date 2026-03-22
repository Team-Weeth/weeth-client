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
        'flex w-full items-center justify-center bg-[#508FFF] pt-[67px] pb-[137px]',
        className,
      )}
    >
      <div className="flex min-w-[648px] items-center gap-[173px]">
        <div className="flex flex-col gap-5">
          <Image src={Ldquo} alt="ldquo" width={48} height={48} className="self-start" />
          <div className="text-2xl leading-[1.6] font-bold text-[#FFFFFF]">
            Weeth는 우리 동아리가 나아가야할 방향을 제시하는 데 큰<br /> 도움이 되었어요. 동아리의
            열정이 이어질 수 있는 공간이에
            <br />
            요.
          </div>
          <Image src={LdquoBack} alt="ldquo" width={48} height={48} className="self-end" />
        </div>

        <div className="flex items-center gap-100">
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
