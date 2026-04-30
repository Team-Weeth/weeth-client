import { cn } from '@/lib/cn';

interface AdminInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  titleGapClassName?: string;
  contentClassName?: string;
}

function AdminInfoCard({
  title,
  className,
  titleGapClassName,
  contentClassName,
  children,
  ...props
}: AdminInfoCardProps) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex w-full max-w-[942px] flex-col rounded-lg py-500 shadow-sm',
        className,
      )}
      {...props}
    >
      <h3 className="typo-sub1 text-text-normal px-600">{title}</h3>
      <div
        className={cn('mt-400 flex flex-col gap-300 px-600', titleGapClassName, contentClassName)}
      >
        {children}
      </div>
    </div>
  );
}

export { AdminInfoCard, type AdminInfoCardProps };
