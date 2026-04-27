'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface ExpandableScheduleTitleProps {
  scheduleId: number | string;
  title: string;
  expandedScheduleId: number | string | null;
  setExpandedScheduleId: React.Dispatch<React.SetStateAction<number | string | null>>;
}

function ExpandableScheduleTitle({
  scheduleId,
  title,
  expandedScheduleId,
  setExpandedScheduleId,
}: ExpandableScheduleTitleProps) {
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return;

    const checkOverflow = () => {
      setIsOverflowing(element.scrollWidth > element.clientWidth);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);
    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [title]);

  const isExpanded = expandedScheduleId === scheduleId;

  return (
    <div className="flex min-w-0 items-start gap-100">
      <div className="min-w-0 flex-1">
        <p
          ref={titleRef}
          className={cn(
            'typo-body1 text-text-strong overflow-hidden',
            isExpanded ? 'line-clamp-2 whitespace-normal' : 'whitespace-nowrap',
          )}
        >
          {title}
        </p>
      </div>
      {isOverflowing && (
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-label={`일정 제목 ${isExpanded ? '접기' : '두 줄로 보기'}: ${title}`}
          onClick={() => setExpandedScheduleId((prev) => (prev === scheduleId ? null : scheduleId))}
          className="typo-body2 text-text-disabled hover:text-text-alternative shrink-0 cursor-pointer leading-none transition-colors"
        >
          ...
        </button>
      )}
    </div>
  );
}

export { ExpandableScheduleTitle, type ExpandableScheduleTitleProps };
