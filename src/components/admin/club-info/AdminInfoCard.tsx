import { cn } from '@/lib/cn';

interface AdminInfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

function AdminInfoCard({
  title,
  className,
  children,
  ...props
}: AdminInfoCardProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-[942px] flex-col gap-400 rounded-lg bg-container-neutral p-400 pb-400 shadow-sm',
        className,
      )}
      {...props}
    >
      <h3 className="typo-sub1 text-text-normal">{title}</h3>
      {children}
    </div>
  );
}

export { AdminInfoCard, type AdminInfoCardProps };
