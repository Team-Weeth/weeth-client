import { ScheduleFormField } from '@/components/admin/schedule/ScheduleFormField';

interface ScheduleTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function ScheduleTextField({ label, value, onChange, placeholder }: ScheduleTextFieldProps) {
  return (
    <ScheduleFormField label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
      />
    </ScheduleFormField>
  );
}

export { ScheduleTextField, type ScheduleTextFieldProps };
