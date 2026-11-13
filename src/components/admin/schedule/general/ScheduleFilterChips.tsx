'use client';

import { cn } from '@/lib/cn';
import type { ScheduleType } from '@/types/admin/schedule';

type ScheduleFilter = 'all' | ScheduleType;

interface ScheduleFilterChipsProps {
  totalCount: number;
  eventCount: number;
  sessionCount: number;
  activeFilter: ScheduleFilter;
  onFilterChange: (filter: ScheduleFilter) => void;
  className?: string;
}

const CHIPS: {
  key: ScheduleFilter;
  label: string;
  countKey: 'totalCount' | 'eventCount' | 'sessionCount';
}[] = [
  { key: 'all', label: '전체', countKey: 'totalCount' },
  { key: 'EVENT', label: '일반 일정', countKey: 'eventCount' },
  { key: 'SESSION', label: '세션', countKey: 'sessionCount' },
];

function ScheduleFilterChips({
  totalCount,
  eventCount,
  sessionCount,
  activeFilter,
  onFilterChange,
  className,
}: ScheduleFilterChipsProps) {
  const counts = { totalCount, eventCount, sessionCount };

  return (
    <div className={cn('flex items-center gap-[5px]', className)}>
      {CHIPS.map(({ key, label, countKey }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={cn(
              'typo-button2 flex min-w-[40px] cursor-pointer items-center justify-center rounded-[10px] px-400 py-200 transition-colors',
              isActive
                ? 'bg-button-neutral text-text-strong border border-transparent'
                : 'border-line text-text-normal hover:bg-container-neutral-interaction border',
            )}
          >
            {label} {counts[countKey]}
          </button>
        );
      })}
    </div>
  );
}

export { ScheduleFilterChips, type ScheduleFilterChipsProps, type ScheduleFilter };
