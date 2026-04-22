import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';

interface ScheduleTextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function ScheduleTextareaField({
  label,
  value,
  onChange,
  placeholder,
}: ScheduleTextareaFieldProps) {
  return (
    <ScheduleFormField label={label}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-[150px] w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
      />
    </ScheduleFormField>
  );
}

export { ScheduleTextareaField, type ScheduleTextareaFieldProps };
