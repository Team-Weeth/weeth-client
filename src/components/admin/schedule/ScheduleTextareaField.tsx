import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';

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
  return (
    <ScheduleFormField label={label}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-37.5 w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
      />
      {maxLength !== undefined && (
        <span className="typo-caption2 text-text-alternative mt-100 self-end">
          {value.length}/{maxLength}
        </span>
      )}
    </ScheduleFormField>
  );
}

export { ScheduleTextareaField, type ScheduleTextareaFieldProps };
