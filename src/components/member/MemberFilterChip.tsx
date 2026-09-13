import { type ChipProps } from '@/components/ui/chips';
import { cn } from '@/lib/cn';

interface MemberFilterChipProps extends ChipProps {
  selected?: boolean;
}

function MemberFilterChip({ selected = false, className, ...props }: MemberFilterChipProps) {
  return (
    <button
      className={cn(
        'typo-button2 text-text-inverse cursor-pointer rounded-[10px] border-none px-400 py-200 transition-colors',
        selected
          ? 'bg-brand-primary hover:bg-button-primary-interaction text-text-inverse'
          : 'bg-container-neutral-alternative hover:bg-button-neutral-interaction text-text-normal',
        className,
      )}
      {...props}
    />
  );
}

export { MemberFilterChip, type MemberFilterChipProps };
