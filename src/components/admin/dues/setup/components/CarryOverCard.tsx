import { cn } from '@/lib/cn';

interface CarryOverCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

function CarryOverCard({ title, description, selected, onClick }: CarryOverCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={cn(
        'flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-400 text-left transition-colors',
        selected ? 'border-brand-primary' : 'border-border',
      )}
    >
      <div className="flex flex-col gap-100">
        <span className={cn('typo-sub3', selected ? 'text-brand-primary' : 'text-text-normal')}>
          {title}
        </span>
        {selected && <span className="typo-caption2 text-text-alternative">{description}</span>}
      </div>
      <div
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-brand-primary' : 'border-border',
        )}
      >
        {selected && <div className="bg-brand-primary size-2.5 rounded-full" />}
      </div>
    </button>
  );
}

export { CarryOverCard };
