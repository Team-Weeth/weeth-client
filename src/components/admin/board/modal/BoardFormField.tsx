interface BoardFormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function BoardFormField({ label, htmlFor, children }: BoardFormFieldProps) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={htmlFor}
        className="typo-caption1 text-text-normal flex h-12 items-center px-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export { BoardFormField, type BoardFormFieldProps };
