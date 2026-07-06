interface CharacterCountRowProps {
  error?: string;
  value: string;
  maxLength: number;
}

function CharacterCountRow({ error, value, maxLength }: CharacterCountRowProps) {
  return (
    <div className="grid min-h-4 grid-cols-[minmax(0,1fr)_auto] items-start gap-200">
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
