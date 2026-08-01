import { ScheduleFormField } from '@/components/admin/schedule/general/ScheduleFormField';

interface ScheduleTextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

function ScheduleTextareaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: ScheduleTextareaFieldProps) {
  const handleChange = (nextValue: string) => {
    onChange(maxLength === undefined ? nextValue : nextValue.slice(0, maxLength));
  };

  return (
    <ScheduleFormField label={label}>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-37.5 w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
      />
      {maxLength !== undefined && (
        <span className="typo-caption2 text-text-alternative mt-100 self-end">
          {Math.min(value.length, maxLength)}/{maxLength}
        </span>
      )}
    </ScheduleFormField>
  );
}

export { ScheduleTextareaField, type ScheduleTextareaFieldProps };
