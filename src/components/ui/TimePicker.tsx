'use client';

import { useEffect, useRef, useState } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@/lib/cn';
import { HOURS, MINUTES } from '@/constants/shared/date';
import { formatTimeDisplay } from '@/utils/shared/date';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const MINUTE_STEP = 5;

function parseTimeValue(value: string): { h: number; m: number } {
  if (!value) return { h: 0, m: 0 };
  const [hRaw, mRaw] = value.split(':').map(Number);
  const h = Number.isFinite(hRaw) && hRaw >= 0 && hRaw <= 23 ? hRaw : 0;
  const mValid = Number.isFinite(mRaw) && mRaw >= 0 && mRaw <= 59 ? mRaw : 0;
  // 5분 단위 리스트와 정렬되도록 floor 스냅 (예: 23:59 → 23:55)
  const m = Math.floor(mValid / MINUTE_STEP) * MINUTE_STEP;
  return { h, m };
}

function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const { h, m } = parseTimeValue(value);

  // 팝오버 전체 영역에서 wheel 스크롤을 받아 커서가 위치한 컬럼(또는 둘 다)을 스크롤
  useEffect(() => {
    if (!open) return;
    const content = contentRef.current;
    if (!content) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const target = e.target as Node;
      const overHour = hourRef.current?.contains(target);
      const overMinute = minuteRef.current?.contains(target);

      if (overHour && hourRef.current) {
        hourRef.current.scrollTop += e.deltaY;
      } else if (overMinute && minuteRef.current) {
        minuteRef.current.scrollTop += e.deltaY;
      } else {
        // divider/padding 영역 → 양쪽 컬럼 동시 스크롤
        if (hourRef.current) hourRef.current.scrollTop += e.deltaY;
        if (minuteRef.current) minuteRef.current.scrollTop += e.deltaY;
      }
    };

    content.addEventListener('wheel', handleWheel, { passive: false });
    return () => content.removeEventListener('wheel', handleWheel);
  }, [open]);

  const handleSelect = (hour: number, minute: number) => {
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    onChange(`${hh}:${mm}`);
    setOpen(false);
  };

  // 열릴 때 현재 선택값으로 스크롤
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      requestAnimationFrame(() => {
        hourRef.current
          ?.querySelector('[data-selected="true"]')
          ?.scrollIntoView({ block: 'center' });
        minuteRef.current
          ?.querySelector('[data-selected="true"]')
          ?.scrollIntoView({ block: 'center' });
      });
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="bg-container-neutral data-[state=open]:border-brand-primary data-[state=open]:ring-brand-primary/15 flex h-10 cursor-pointer items-center rounded-sm border border-transparent px-300 transition-shadow data-[state=open]:ring-4"
        >
          <span className="typo-body1 text-text-normal">
            {value ? formatTimeDisplay(value) : '시간 선택'}
          </span>
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={contentRef}
          sideOffset={4}
          align="start"
          className="bg-container-neutral z-50 flex h-60 rounded-md shadow-[0px_4px_14px_0px_rgba(0,0,0,0.25)]"
        >
          {/* Hours */}
          <div ref={hourRef} className="scrollbar-custom flex flex-col overflow-y-auto py-100">
            {HOURS.map((hour) => {
              const isSelected = h === hour;
              const period = hour < 12 ? '오전' : '오후';
              const display = hour % 12 || 12;
              return (
                <button
                  key={hour}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleSelect(hour, m)}
                  className={cn(
                    'typo-body2 flex h-9 w-24 shrink-0 cursor-pointer items-center px-300 whitespace-nowrap transition-colors',
                    isSelected
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-text-normal hover:bg-container-neutral-interaction',
                  )}
                >
                  {period} {display}시
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="bg-line w-px" />

          {/* Minutes */}
          <div ref={minuteRef} className="scrollbar-custom flex flex-col overflow-y-auto py-100">
            {MINUTES.map((minute) => {
              const isSelected = m === minute;
              return (
                <button
                  key={minute}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => handleSelect(h, minute)}
                  className={cn(
                    'typo-body2 flex h-9 w-18 shrink-0 cursor-pointer items-center px-300 transition-colors',
                    isSelected
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-text-normal hover:bg-container-neutral-interaction',
                  )}
                >
                  {String(minute).padStart(2, '0')}분
                </button>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { TimePicker, type TimePickerProps };
