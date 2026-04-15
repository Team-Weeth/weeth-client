interface FieldBlockProps {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldBlock({ label, helper, error, children }: FieldBlockProps) {
  return (
    <div className="flex flex-col gap-300">
      <span className="typo-caption1 text-text-normal">{label}</span>
      {children}
      {error ? (
        <span className="typo-caption2 text-state-error">{error}</span>
      ) : (
        helper && <span className="typo-caption2 text-text-alternative">{helper}</span>
      )}
    </div>
  );
}

export { FieldBlock, type FieldBlockProps };
