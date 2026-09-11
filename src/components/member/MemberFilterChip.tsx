import { type ChipProps } from '@/components/ui/chips';
import { cn } from '@/lib/cn';

interface MemberFilterChipProps extends ChipProps {
  selected?: boolean;
}

function MemberFilterChip({ selected = false, className, ...props }: MemberFilterChipProps) {
  return (
    <button
      className={cn(
        'typo-button2 rounded-[10px] border-none px-400 py-200 transition-colors',
        selected
          ? 'bg-brand-primary text-text-inverse'
          : 'bg-container-neutral-alternative text-text-normal',
        className,
      )}
      {...props}
    />
  );
}

export { MemberFilterChip, type MemberFilterChipProps };
