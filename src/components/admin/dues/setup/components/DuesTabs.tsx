import { cn } from '@/lib/cn';

interface TabItem<T extends string> {
  key: T;
  label: string;
}

interface DuesTabsProps<T extends string> {
  tabs: readonly TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

function DuesTabs<T extends string>({ tabs, activeTab, onTabChange }: DuesTabsProps<T>) {
  return (
    <div className="flex gap-200">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onTabChange(key)}
          className={cn(
            'typo-button2 cursor-pointer rounded-sm border px-400 py-200 transition-colors',
            activeTab === key
              ? 'bg-container-neutral-alternative text-text-strong border-transparent'
              : 'border-border text-text-normal bg-transparent',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export { DuesTabs, type DuesTabsProps };
