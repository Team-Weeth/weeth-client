import { ScheduleFormField } from '@/components/admin/schedule/general/ScheduleFormField';
import { cn } from '@/lib/cn';

interface ScheduleTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// TODO: label, maxLength 표시되는 공용 인풋 컴포넌트 만들기
function ScheduleTextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  className,
}: ScheduleTextFieldProps) {
  return (
    <ScheduleFormField label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          'bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none',
          className,
        )}
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
