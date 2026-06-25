import { ArrowLeftIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';

function PrevButton({ handlePrev }: { handlePrev: () => void }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handlePrev}
        className="bg-button-neutral hover:bg-button-neutral-interaction typo-button1 text-text-strong flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors"
      >
        <Icon src={ArrowLeftIcon} alt="" size={12} />
        이전으로
      </button>
    </div>
  );
}

export { PrevButton };
