import { cn } from '@/lib/cn';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  color: string;
  bgColor: string;
}

function Tag({ color, bgColor, className, style, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'typo-caption1 inline-flex w-fit items-center rounded-sm px-200 py-100 whitespace-nowrap',
        className,
      )}
      style={{ color, backgroundColor: bgColor, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}

export { Tag, type TagProps };
