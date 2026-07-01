import { ArrowRightIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

function NextButton({
  last = false,
  editMode = false,
  handleNext,
  disabled = false,
}: {
  last?: boolean;
  editMode?: boolean;
  handleNext: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleNext}
        disabled={disabled}
        className={cn(
          'bg-button-primary hover:bg-button-primary-interaction typo-button1 text-text-inverse flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {editMode ? '수정 완료' : last ? '저장하고 완료하기' : '다음으로'}
        <Icon src={ArrowRightIcon} alt="" size={12} />
      </button>
    </div>
  );
}

export { NextButton };
