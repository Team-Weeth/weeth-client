import Link from 'next/link';
import { cn } from '@/lib/cn';
import Image from 'next/image';
import { LandingMockUp } from '@/assets/icons/landing';

interface CTASectionProps {
  className?: string;
}

function CTASection({ className }: CTASectionProps) {
  return (
    <section
      className={cn(
        'flex w-full items-center justify-center bg-[#F3F5F7] pt-[207px] pb-[131px]',
        className,
      )}
    >
      <div className="relative flex h-[397px] max-w-[1408px] items-center rounded-[40px] bg-[#FFFFFF] px-[160px] pt-[90px] pb-[78px]">
        <Image
          src={LandingMockUp}
          alt="Weeth 홈페이지"
          width={495}
          height={519}
          className="absolute bottom-0 left-[86px] h-[519px] w-auto"
        />
        <div className="w-[495px] shrink-0" />
        <div className="flex flex-col">
          <h2 className="mb-[19px] text-center text-[40px] leading-[48px] font-bold tracking-[-0.005em] text-[#1E2021]">
            함께하는 순간이 더 오래 이어지도록
          </h2>
          <p className="mb-[66px] text-[16px] leading-[24px] font-[470] tracking-[-0.005em] text-[#1E2021]">
            동아리 정보를 입력하고,
            <br />
            3분 만에 사이트를 개설해보세요.
          </p>
          <Link
            href="/login"
            className="typo-button1 block w-fit rounded-md bg-[#00C8AA] px-400 py-300 text-white"
          >
            동아리 사이트 개설 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}

export { CTASection };
