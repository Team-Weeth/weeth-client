interface TextInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  error?: string;
}

export function DuesTextInputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
}: TextInputFieldProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="typo-sub3 text-text-normal flex h-12 items-center px-400">
        {label}
      </label>
      <div className="flex flex-col gap-200">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          {error ? <span className="typo-caption2 text-state-error">{error}</span> : <span />}
          <span className="typo-caption2 text-text-alternative pr-100">
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
