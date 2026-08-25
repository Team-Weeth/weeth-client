'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ArrowLeftIcon, ArrowRightIcon } from '@/assets/icons';

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  className?: string;
}

function CalendarHeader({ year, month, onPrevMonth, onNextMonth, className }: CalendarHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-500 py-400', className)}>
      <button
        type="button"
        aria-label="이전 달"
        onClick={onPrevMonth}
        className="hover:bg-container-neutral-interaction flex size-9 cursor-pointer items-center justify-center rounded-sm transition-colors"
      >
        <Image src={ArrowLeftIcon} alt="" aria-hidden="true" width={20} height={20} />
      </button>

      <h2 className="typo-sub2 text-text-strong">
        {year}년 {month}월
      </h2>

      <button
        type="button"
        aria-label="다음 달"
        onClick={onNextMonth}
        className="hover:bg-container-neutral-interaction flex size-9 cursor-pointer items-center justify-center rounded-sm transition-colors"
      >
        <Image src={ArrowRightIcon} alt="" aria-hidden="true" width={20} height={20} />
      </button>
    </div>
  );
}

export { CalendarHeader, type CalendarHeaderProps };
