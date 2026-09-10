'use client';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import ArrowLeftIcon from '@/assets/icons/arrow_left.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import InfoCircleIcon from '@/assets/icons/info_circle.svg';

const MONTHS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

interface CalendarMonthPickerProps {
  year: number;
  selectedMonth: number;
  onMonthSelect: (month: number) => void;
  onYearChange?: (year: number) => void;
  onGoToToday?: () => void;
  className?: string;
}

function CalendarMonthPicker({
  year,
  selectedMonth,
  onMonthSelect,
  onYearChange,
  onGoToToday,
  className,
}: CalendarMonthPickerProps) {
  return (
    <div className={cn('flex flex-col items-center gap-600 px-450 pt-300 pb-700', className)}>
      {/* Year navigation */}
      <div className="flex w-full items-center justify-center gap-400">
        <Button
          variant="secondary"
          aria-label="이전 연도"
          onClick={() => onYearChange?.(year - 1)}
          className="size-8 rounded-md p-0"
        >
          <Icon src={ArrowLeftIcon} size={9} className="text-icon-normal" alt="이전 연도" />
        </Button>

        <h3 className="typo-h3 text-text-normal text-center">{year}년</h3>

        <Button
          variant="secondary"
          aria-label="다음 연도"
          onClick={() => onYearChange?.(year + 1)}
          className="size-8 rounded-md p-0"
        >
          <Icon src={ArrowRightIcon} size={9} className="text-icon-normal" alt="다음 연도" />
        </Button>
      </div>

      {/* Month grid — 3 columns */}
      <div className="grid w-full grid-cols-3 gap-[7px]">
        {MONTHS.map((label, index) => {
          const month = index + 1;
          const isSelected = month === selectedMonth;

          return (
            <Button
              key={month}
              variant={isSelected ? 'primary' : 'secondary'}
              aria-label={`${year}년 ${label}`}
              aria-pressed={isSelected}
              onClick={() => onMonthSelect(month)}
              className={cn(
                'typo-sub3 h-20 w-full rounded-md border p-0',
                isSelected
                  ? 'border-container-primary'
                  : 'border-line bg-container-neutral text-text-alternative',
              )}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* Go to today CTA */}
      <Button variant="primary" size="lg" onClick={onGoToToday} className="w-full">
        오늘 날짜로 이동
      </Button>

      {/* Info box */}
      <div className="bg-container-neutral-interaction flex items-start gap-300 self-stretch rounded-md px-300 py-400">
        <Icon
          src={InfoCircleIcon}
          size={20}
          className="text-icon-alternative shrink-0"
          alt="안내"
        />
        <p className="typo-caption2 text-text-normal mt-[2px]">
          캘린더에서 좌우로 스와이프하면 월을 빠르게 이동할 수 있어요.
        </p>
      </div>
    </div>
  );
}

export { CalendarMonthPicker, type CalendarMonthPickerProps };
