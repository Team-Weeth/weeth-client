import { ScheduleFormField } from '@/components/admin/schedule/general/ScheduleFormField';
import { cn } from '@/lib/cn';

interface ScheduleTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  error?: string;
}

// TODO: label, maxLength 표시되는 공용 인풋 컴포넌트 만들기
function ScheduleTextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  className,
  error,
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
          error && 'ring-state-error ring-1',
          className,
        )}
      />
      {(error || maxLength !== undefined) && (
        <div className="mt-100 flex items-center justify-between px-100">
          {error ? (
            <span className="typo-caption2 text-state-error">{error}</span>
          ) : (
            <span />
          )}
          {maxLength !== undefined && (
            <span className="typo-caption2 text-text-alternative">
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </ScheduleFormField>
  );
}

export { ScheduleTextField, type ScheduleTextFieldProps };
