import ArrowLeftIcon from '@/assets/icons/arrow_left.svg';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

function PrevButton({
  handlePrev,
  disabled = false,
}: {
  handlePrev: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handlePrev}
        disabled={disabled}
        className={cn(
          'bg-button-neutral hover:bg-button-neutral-interaction typo-button1 text-text-strong flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <Icon src={ArrowLeftIcon} alt="" size={12} />
        이전으로
      </button>
    </div>
  );
}

export { PrevButton };
