import { cn } from '@/lib/cn';

interface CharacterCountRowProps {
  error?: string;
  value: string;
  maxLength: number;
  className?: string;
}

function CharacterCountRow({ error, value, maxLength, className }: CharacterCountRowProps) {
  return (
    <div
      className={cn('grid min-h-4 grid-cols-[minmax(0,1fr)_auto] items-start gap-200', className)}
    >
      <div className="min-w-0">
        {error ? (
          <span className="typo-caption2 text-state-error block truncate">{error}</span>
        ) : null}
      </div>
      <span className="typo-caption2 text-text-alternative shrink-0 text-right">
        {value.length}/{maxLength}
      </span>
    </div>
  );
}

export { CharacterCountRow, type CharacterCountRowProps };
