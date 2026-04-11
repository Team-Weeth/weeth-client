import { cn } from '@/lib/cn';

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function FormField({ label, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-200', className)}>
      <span className="typo-caption1 text-text-alternative">{label}</span>
      {children}
      {error && <span className="typo-caption2 text-state-error">{error}</span>}
      {!error && hint && <span className="typo-caption2 text-text-alternative">{hint}</span>}
    </div>
  );
}

export { FormField, type FormFieldProps };
