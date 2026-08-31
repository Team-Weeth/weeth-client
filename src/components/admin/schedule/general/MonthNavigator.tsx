'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { formatYearMonth } from '@/utils/admin/scheduleUtils';
import AdminSquareLeftIcon from '@/assets/icons/admin/ic_admin_square_left.svg';
import AdminSquareRightIcon from '@/assets/icons/admin/ic_admin_square_right.svg';

interface MonthNavigatorProps extends React.HTMLAttributes<HTMLDivElement> {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

function MonthNavigator({ className, year, month, onPrev, onNext, ...props }: MonthNavigatorProps) {
  return (
    <div className={cn('flex items-center gap-200', className)} {...props}>
      <button
        type="button"
        onClick={onPrev}
        className="hover:bg-container-neutral-interaction flex size-5 cursor-pointer items-center justify-center rounded-sm"
      >
        <Image src={AdminSquareLeftIcon} alt="이전 달" width={20} height={20} />
      </button>
      <span className="typo-sub1 text-text-strong">{formatYearMonth(year, month)}</span>
      <button
        type="button"
        onClick={onNext}
        className="hover:bg-container-neutral-interaction flex size-5 cursor-pointer items-center justify-center rounded-sm"
      >
        <Image src={AdminSquareRightIcon} alt="다음 달" width={20} height={20} />
      </button>
    </div>
  );
}

export { MonthNavigator, type MonthNavigatorProps };
