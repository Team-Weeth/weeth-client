import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui';
import { AdminCalendarIcon } from '@/assets/icons/admin';
import { LocationIcon } from '@/assets/icons';

const scheduleTagVariants = cva(
  'typo-caption1 inline-flex h-6 items-center gap-100 rounded-sm px-200 py-100 whitespace-nowrap',
  {
    variants: {
      variant: {
        type: 'bg-brand-primary/10 text-brand-primary',
        info: 'bg-container-neutral-alternative text-text-alternative',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

interface ScheduleTagProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof scheduleTagVariants> {
  icon?: 'calendar' | 'location';
}

function ScheduleTag({ className, variant, icon, children, ...props }: ScheduleTagProps) {
  return (
    <span className={cn(scheduleTagVariants({ variant }), className)} {...props}>
      {icon === 'calendar' && (
        <Icon src={AdminCalendarIcon} size={16} className="text-text-alternative" />
      )}
      {icon === 'location' && (
        <Icon src={LocationIcon} size={16} className="text-text-alternative" />
      )}
      {children}
    </span>
  );
}

export { ScheduleTag, scheduleTagVariants, type ScheduleTagProps };
