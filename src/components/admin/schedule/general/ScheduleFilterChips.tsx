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

const CHIPS: { key: ScheduleFilter; label: string; countKey: 'totalCount' | 'eventCount' | 'sessionCount' }[] = [
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
    <div className={cn('flex items-center gap-200', className)}>
      {CHIPS.map(({ key, label, countKey }) => {
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilterChange(key)}
            className={cn(
              'typo-caption1 flex cursor-pointer items-center gap-100 rounded-full px-300 py-200 transition-colors',
              isActive
                ? 'bg-button-primary text-text-inverse'
                : 'bg-container-neutral text-text-alternative hover:bg-container-neutral-interaction',
            )}
          >
            {label}
            <span className={cn('typo-caption2', isActive ? 'text-text-inverse' : 'text-text-disabled')}>
              {counts[countKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { ScheduleFilterChips, type ScheduleFilterChipsProps, type ScheduleFilter };
