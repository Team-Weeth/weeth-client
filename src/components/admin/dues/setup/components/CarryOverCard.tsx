import { cn } from '@/lib/cn';

interface CarryOverCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function CarryOverCard({ title, description, selected, onClick, disabled = false }: CarryOverCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      className={cn(
        'flex flex-1 items-center justify-between rounded-lg border p-400 text-left transition-colors',
        disabled
          ? 'border-border cursor-not-allowed opacity-40'
          : selected
            ? 'border-brand-primary cursor-pointer'
            : 'border-border cursor-pointer',
      )}
    >
      <div className="flex flex-col gap-100">
        <span
          className={cn(
            'typo-sub3',
            disabled ? 'text-text-disabled' : selected ? 'text-brand-primary' : 'text-text-normal',
          )}
        >
          {title}
        </span>
        {selected && !disabled && (
          <span className="typo-caption2 text-text-alternative">{description}</span>
        )}
      </div>
      <div
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          disabled ? 'border-border' : selected ? 'border-brand-primary' : 'border-border',
        )}
      >
        {selected && !disabled && <div className="bg-brand-primary size-2.5 rounded-full" />}
      </div>
    </button>
  );
}

export { CarryOverCard };
