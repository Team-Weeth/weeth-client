import { cn } from '@/lib/cn';

interface DuesTransactionFilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

function DuesTransactionFilterChip({
  active,
  className,
  type = 'button',
  ...props
}: DuesTransactionFilterChipProps) {
  return (
    <button
      type={type}
      className={cn(
        'typo-button2 text-text-normal hover:bg-button-neutral-interaction border-line cursor-pointer rounded-[10px] border px-400 py-200 transition-colors',
        active ? 'bg-button-neutral border-transparent' : 'bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

export { DuesTransactionFilterChip, type DuesTransactionFilterChipProps };
