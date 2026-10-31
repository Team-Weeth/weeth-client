import { cn } from '@/lib/cn';

interface AdminPageContainerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

function AdminPageContainer({ children, className, innerClassName }: AdminPageContainerProps) {
  return (
    <div className={cn('flex min-h-full min-w-0 pr-450', className)}>
      <div
        className={cn(
          'bg-container-neutral flex min-w-0 flex-1 flex-col rounded-t-[20px]',
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { AdminPageContainer, type AdminPageContainerProps };
