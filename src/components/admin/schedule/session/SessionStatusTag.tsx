import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { SESSION_STATUS_LABEL } from '@/constants/admin/session.constants';
import type { SessionStatus } from '@/types/admin/session';

const sessionStatusTagVariants = cva(
  'typo-caption1 inline-flex h-6 items-center gap-200 rounded-full px-200 py-100 whitespace-nowrap',
  {
    variants: {
      status: {
        OPEN: 'bg-brand-primary/10 text-brand-primary',
        COMPLETED: 'bg-text-disabled/10 text-text-disabled',
        SCHEDULED: 'bg-state-caution/10 text-state-caution',
        CANCELED: 'bg-state-error/10 text-state-error',
      },
    },
    defaultVariants: {
      status: 'OPEN',
    },
  },
);

const sessionStatusDotVariants = cva('size-1 shrink-0 rounded-full', {
  variants: {
    status: {
      OPEN: 'bg-brand-primary',
      COMPLETED: 'bg-text-disabled',
      SCHEDULED: 'bg-state-caution',
      CANCELED: 'bg-state-error',
    },
  },
  defaultVariants: {
    status: 'OPEN',
  },
});

interface SessionStatusTagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: SessionStatus;
  ref?: React.Ref<HTMLSpanElement>;
}

function SessionStatusTag({ className, status, ref, ...props }: SessionStatusTagProps) {
  return (
    <span ref={ref} className={cn(sessionStatusTagVariants({ status }), className)} {...props}>
      <span className={cn(sessionStatusDotVariants({ status }))} />
      {SESSION_STATUS_LABEL[status]}
    </span>
  );
}

export { SessionStatusTag, sessionStatusTagVariants, type SessionStatusTagProps };
