import { cn } from '@/lib/cn';

interface ScheduleFormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

function ScheduleFormField({ label, className, children, ...props }: ScheduleFormFieldProps) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <div className="flex h-12 items-center px-400">
        <label className="typo-sub3 text-text-normal">{label}</label>
      </div>
      {children}
    </div>
  );
}

export { ScheduleFormField, type ScheduleFormFieldProps };
