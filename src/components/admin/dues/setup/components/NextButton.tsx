import { ArrowRightIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';

function NextButton({ last = false, handleNext }: { last?: boolean; handleNext: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleNext}
        className="bg-button-primary hover:bg-button-primary-interaction typo-button1 text-text-inverse flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors"
      >
        {last ? '저장하고 완료하기' : '다음으로'}
        <Icon src={ArrowRightIcon} alt="" size={12} />
      </button>
    </div>
  );
}

export { NextButton };
