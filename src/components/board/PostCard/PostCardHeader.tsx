import { cn } from '@/lib/cn';

function PostCardHeader({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center justify-between self-stretch', className)} {...props}>
      {children}
    </div>
  );
}

export { PostCardHeader };
