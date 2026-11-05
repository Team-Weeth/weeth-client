import { cn } from '@/lib/cn';

function PostCardRoot({ className, children, ...props }: React.ComponentProps<'article'>) {
  return (
    <article
      className={cn(
        'bg-container-neutral flex flex-col items-start gap-400 self-stretch overflow-x-hidden rounded-(--radius-lg) px-450 py-400',
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}

export { PostCardRoot };
