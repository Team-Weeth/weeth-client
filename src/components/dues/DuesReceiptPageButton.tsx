import ArrowLeftIcon from '@/assets/icons/arrow_left.svg';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface DuesReceiptPageButtonProps {
  direction: 'previous' | 'next';
  onClick: () => void;
  className?: string;
}

function DuesReceiptPageButton({ direction, onClick, className }: DuesReceiptPageButtonProps) {
  const isPrevious = direction === 'previous';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute top-1/2 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center text-white transition-opacity hover:opacity-70',
        className,
      )}
      aria-label={isPrevious ? '이전 영수증 보기' : '다음 영수증 보기'}
    >
      <Icon src={isPrevious ? ArrowLeftIcon : ArrowRightIcon} size={16} />
    </button>
  );
}

export { DuesReceiptPageButton, type DuesReceiptPageButtonProps };
