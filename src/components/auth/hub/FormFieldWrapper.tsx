function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="typo-caption1 text-text-alternative">{children}</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="typo-caption2 text-state-error">{message}</span>;
}

interface FormFieldWrapperProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormFieldWrapper({ label, error, children }: FormFieldWrapperProps) {
  return (
    <div className="flex flex-col gap-200">
      <FieldLabel>{label}</FieldLabel>
      {children}
      <FieldError message={error} />
    </div>
  );
}

export { FormFieldWrapper, FieldLabel, FieldError };
