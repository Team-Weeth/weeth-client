import { ScheduleFormField } from '@/components/admin/schedule/general/ScheduleFormField';

interface ScheduleTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

function ScheduleTextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: ScheduleTextFieldProps) {
  return (
    <ScheduleFormField label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
      />
      {maxLength !== undefined && (
        <span className="typo-caption2 text-text-alternative mt-100 self-end">
          {value.length}/{maxLength}
        </span>
      )}
    </ScheduleFormField>
  );
}

export { ScheduleTextField, type ScheduleTextFieldProps };
