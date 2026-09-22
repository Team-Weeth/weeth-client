import { cn } from '@/lib/cn';

interface CalendarModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

function CalendarModalFooter({ children, className }: CalendarModalFooterProps) {
  return (
    <div className={cn('px-400 pb-400', className)}>
      <div className="border-line border-t pt-[10px]">{children}</div>
    </div>
  );
}

export { CalendarModalFooter, type CalendarModalFooterProps };
