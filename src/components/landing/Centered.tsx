import { cn } from '@/lib/cn';

interface CenteredProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function Centered({ children, className, ref }: CenteredProps) {
  return (
    <div
      ref={ref}
      className={cn('mx-auto flex flex-col items-center justify-center px-600', className)}
    >
      {children}
    </div>
  );
}

export { Centered };
