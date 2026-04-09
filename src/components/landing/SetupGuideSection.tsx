'use client';

import { cn } from '@/lib/cn';
import { SETUP_GUIDE_STEPS } from '@/constants/landing/landing';
import { motion } from 'framer-motion';

interface SetupGuideSectionProps {
  className?: string;
}

function SetupGuideSection({ className }: SetupGuideSectionProps) {
  return (
    <section
      className={cn(
        'tablet:px-[40px] tablet:pt-[120px] tablet:pb-[100px] desktop:min-h-screen desktop:px-[80px] desktop:pt-[172px] desktop:pb-[145px] flex w-full flex-col items-center justify-center bg-[#F3F5F7] px-600 pt-[80px] pb-[60px]',
        className,
      )}
    >
      <motion.h2
        initial={{ opacity: 0.5, y: 148 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.15, 0.89, 1, 1] }}
        className="tablet:text-[40px] desktop:mb-[80px] desktop:text-[48px] mb-[40px] text-center text-[28px] leading-[1.3] font-extrabold tracking-[-0.005em] text-[#1E2021]"
      >
        <span className="text-[#00C8AA]">3분</span>이면 우리 동아리만의
        <br />
        사이트를 개설할 수 있어요
      </motion.h2>

      <motion.div
        initial={{ opacity: 0.3, y: 188 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.15, 0.89, 1, 1], delay: 0.1 }}
        className="desktop:mb-[29px] desktop:flex-row mb-[24px] flex w-full max-w-[1117px] flex-col gap-400"
      >
        {SETUP_GUIDE_STEPS.map(({ number, title, description, boldText }) => {
          const parts = description.split(boldText);
          return (
            <div
              key={number}
              className="desktop:px-[36px] desktop:py-[32px] flex flex-1 flex-col items-center rounded-[20px] bg-white px-[20px] py-[40px]"
            >
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-md bg-[#E6FFF6]">
                <span className="typo-h3 text-[#00C8AA]">{number}</span>
              </div>
              <p className="font-pretendard desktop:mt-[49px] desktop:text-[32px] desktop:leading-[40px] mt-[32px] text-[24px] leading-[32px] font-extrabold tracking-[-0.005em] text-[#1E2021]">
                {title}
              </p>
              <p className="font-pretendard desktop:mt-[60px] desktop:mb-[50px] desktop:text-[16px] mt-[24px] mb-0 text-[15px] leading-[24px] font-bold tracking-[-0.005em] text-[#909599]">
                {parts[0]}
                <span className="text-[#1E2021]">{boldText}</span>
                {parts[1]}
              </p>
            </div>
          );
        })}
      </motion.div>

      {/* <motion.div
        initial={{ opacity: 0, y: 208 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.15, 0.89, 1, 1], delay: 0.2 }}
      >
        <Link
          href="/login"
          className="typo-button1 block w-fit rounded-full bg-[#00C8AA] px-400 py-300 text-white hover:bg-[#00877a]"
        >
          지금 무료로 시작하기
        </Link>
      </motion.div> */}
    </section>
  );
}

export { SetupGuideSection };
