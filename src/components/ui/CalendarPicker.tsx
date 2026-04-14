'use client';

import { useState } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import Image from 'next/image';

import { cn } from '@/lib/cn';
import { AdminSquareLeftIcon, AdminSquareRightIcon } from '@/assets/icons/admin';
import { DAY_NAMES } from '@/constants/shared/date';
import { formatDateDisplay, getDaysInMonth, getFirstDayOfMonth } from '@/utils/shared/date';

interface CalendarPickerProps {
  value: string;
  onChange: (value: string) => void;
}

function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const parsedDate = value ? new Date(value) : new Date();

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth() + 1);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const base = value ? new Date(value) : new Date();
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth() + 1);
    }
    setOpen(next);
  };

  const selectedYear = value ? parsedDate.getFullYear() : null;
  const selectedMonth = value ? parsedDate.getMonth() + 1 : null;
  const selectedDay = value ? parsedDate.getDate() : null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="bg-container-neutral border border-transparent data-[state=open]:border-brand-primary data-[state=open]:ring-4 data-[state=open]:ring-brand-primary/15 flex h-10 w-30 cursor-pointer items-center rounded-sm px-300 transition-shadow"
        >
          <span className="typo-body1 text-text-normal">
            {value ? formatDateDisplay(value) : '날짜 선택'}
          </span>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={4}
          align="start"
          className="bg-container-neutral z-50 w-72 rounded-md p-400 shadow-[0px_4px_14px_0px_rgba(0,0,0,0.25)]"
        >
          {/* Month navigation */}
          <div className="mb-300 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="hover:bg-container-neutral-interaction flex size-7 cursor-pointer items-center justify-center rounded-sm"
            >
              <Image src={AdminSquareLeftIcon} alt="이전" width={16} height={16} />
            </button>
            <span className="typo-sub2 text-text-strong">
              {viewYear}년 {viewMonth}월
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="hover:bg-container-neutral-interaction flex size-7 cursor-pointer items-center justify-center rounded-sm"
            >
              <Image src={AdminSquareRightIcon} alt="다음" width={16} height={16} />
            </button>
          </div>

          {/* Day of week headers */}
          <div className="mb-100 grid grid-cols-7">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="typo-caption2 text-text-alternative flex h-8 items-center justify-center"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedYear === viewYear && selectedMonth === viewMonth && selectedDay === day;
              const isToday =
                todayYear === viewYear && todayMonth === viewMonth && todayDay === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'typo-caption1 flex h-8 cursor-pointer items-center justify-center rounded-sm transition-colors',
                    isSelected
                      ? 'bg-brand-primary text-text-inverse'
                      : isToday
                        ? 'text-brand-primary hover:bg-container-neutral-interaction'
                        : 'text-text-normal hover:bg-container-neutral-interaction',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { CalendarPicker, type CalendarPickerProps };
