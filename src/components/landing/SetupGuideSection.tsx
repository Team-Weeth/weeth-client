'use client';

import Link from 'next/link';
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
        'flex min-h-screen w-full flex-col items-center justify-center bg-[#F3F5F7] px-[306px] pt-[172px] pb-[145px]',
        className,
      )}
    >
      <motion.h2
        initial={{ opacity: 0.5, y: 148 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.15, 0.89, 1, 1] }}
        className="mb-[80px] text-center text-[48px] leading-[1.3] font-bold tracking-[-0.005em] text-[#1E2021]"
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
        className="mb-[29px] flex w-full max-w-[1117px] gap-400"
      >
        {SETUP_GUIDE_STEPS.map(({ number, title, description, boldText }) => {
          const parts = description.split(boldText);
          return (
            <div
              key={number}
              className="flex flex-1 flex-col items-center justify-center rounded-[20px] bg-white"
            >
              <div className="mt-[32px] flex h-[64px] w-[64px] items-center justify-center rounded-md bg-[#E6FFF6]">
                <span className="typo-h3 text-[#00C8AA]">{number}</span>
              </div>
              <p className="font-pretendard mt-[49px] text-[32px] leading-[40px] font-extrabold tracking-[-0.005em] text-[#1E2021]">
                {title}
              </p>
              <p className="font-pretendard mt-[60px] mb-[50px] px-[36px] text-[16px] leading-[24px] font-bold tracking-[-0.005em] text-[#909599]">
                {parts[0]}
                <span className="text-[#1E2021]">{boldText}</span>
                {parts[1]}
              </p>
            </div>
          );
        })}
      </motion.div>

      <motion.div
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
      </motion.div>
    </section>
  );
}

export { SetupGuideSection };
