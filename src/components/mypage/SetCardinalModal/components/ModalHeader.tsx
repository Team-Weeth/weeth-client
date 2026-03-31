import { Icon } from '@/components/ui';
import { DeleteIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex w-[133px] gap-[9px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full',
            i < current ? 'bg-button-primary' : 'bg-button-neutral',
          )}
        />
      ))}
    </div>
  );
}

interface ModalHeaderProps {
  step: number;
  total: number;
  overline: string;
  title: string;
  onClose: () => void;
}

function ModalHeader({ step, total, overline, title, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-400 p-400">
      <div className="flex flex-1 flex-col gap-400">
        <StepIndicator current={step} total={total} />
        <div className="flex flex-col gap-200">
          <p className="typo-caption1 text-text-alternative">{overline}</p>
          <p className="typo-sub1 text-text-strong">{title}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="flex cursor-pointer items-center justify-center rounded-sm p-200"
      >
        <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
      </button>
    </div>
  );
}

export { ModalHeader, type ModalHeaderProps };
