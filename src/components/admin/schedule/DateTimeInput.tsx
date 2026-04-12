'use client';

import { cn } from '@/lib/cn';
import { CalendarPicker } from '@/components/admin/schedule/CalendarPicker';
import { TimePicker } from '@/components/admin/schedule/TimePicker';

interface DateTimeInputProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

function DateTimeInput({
  className,
  label,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  ...props
}: DateTimeInputProps) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <div className="flex h-12 items-center px-400">
        <span className="typo-sub2 text-text-normal">{label}</span>
      </div>
      <div className="flex items-center gap-200">
        <CalendarPicker value={dateValue} onChange={onDateChange} />
        <TimePicker value={timeValue} onChange={onTimeChange} />
      </div>
    </div>
  );
}

export { DateTimeInput, type DateTimeInputProps };
