'use client';

import { useRef } from 'react';

import { cn } from '@/lib/cn';

interface DateTimeInputProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${year}. ${month}. ${day}.`;
}

function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const displayHour = h % 12 || 12;
  return `${period} ${displayHour}:${String(m).padStart(2, '0')}`;
}

function DateTimeInput({
  className,
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  ...props
}: DateTimeInputProps) {
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <div className="flex h-12 items-center px-400">
        <span className="typo-sub2 text-text-normal">{label}</span>
      </div>
      <div className="flex items-center gap-200">
        {/* Date picker */}
        <button
          type="button"
          onClick={() => dateRef.current?.showPicker()}
          className="bg-container-neutral relative flex h-10 w-30 cursor-pointer items-center rounded-sm px-300"
        >
          <span className="typo-body1 text-text-normal">
            {dateValue ? formatDateDisplay(dateValue) : '날짜 선택'}
          </span>
          <input
            ref={dateRef}
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            className="pointer-events-none absolute inset-0 opacity-0"
            tabIndex={-1}
          />
        </button>

        {/* Time picker */}
        <button
          type="button"
          onClick={() => timeRef.current?.showPicker()}
          className="bg-container-neutral relative flex h-10 cursor-pointer items-center rounded-sm px-300"
        >
          <span className="typo-body1 text-text-normal">
            {timeValue ? formatTimeDisplay(timeValue) : '시간 선택'}
          </span>
          <input
            ref={timeRef}
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
            className="pointer-events-none absolute inset-0 opacity-0"
            tabIndex={-1}
          />
        </button>
      </div>
    </div>
  );
}

export { DateTimeInput, type DateTimeInputProps };
