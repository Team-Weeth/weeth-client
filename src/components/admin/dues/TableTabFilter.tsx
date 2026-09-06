'use client';

import ConvertIcon from '@/assets/icons/convert.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface TableTabItem<K extends string> {
  key: K;
  label: string;
  count: number;
}

interface TableTabFilterProps<K extends string> extends React.HTMLAttributes<HTMLDivElement> {
  tabs: TableTabItem<K>[];
  activeTab: K;
  onTabChange: (key: K) => void;
  /** 정렬 버튼에 표시할 라벨 (예: sortDesc ? '최근 순' : '오래된 순') */
  sortLabel: string;
  onSortToggle: () => void;
}

function TableTabFilter<K extends string>({
  className,
  tabs,
  activeTab,
  onTabChange,
  sortLabel,
  onSortToggle,
  ...props
}: TableTabFilterProps<K>) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-between gap-200', className)}
      {...props}
    >
      <div className="flex gap-[5px] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'typo-button2 min-w-10 shrink-0 cursor-pointer rounded-[10px] px-400 py-200 transition-colors',
              activeTab === tab.key
                ? 'bg-button-neutral text-text-strong'
                : 'border-line text-text-normal hover:bg-container-neutral-interaction border',
            )}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onSortToggle}
        className="typo-button2 border-line text-text-normal hover:bg-container-neutral-interaction flex min-w-10 shrink-0 cursor-pointer flex-row gap-100 rounded-[10px] border px-400 py-200 transition-colors"
      >
        <Icon src={ConvertIcon} size={18} alt="정렬 전환" className="flex self-center" />
        {sortLabel}
      </button>
    </div>
  );
}

export { TableTabFilter, type TableTabFilterProps, type TableTabItem };
