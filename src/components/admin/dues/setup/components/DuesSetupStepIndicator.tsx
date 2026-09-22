import CheckIcon from '@/assets/icons/check.svg';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

const STEPS = [
  { step: 1, label: '기본 정보' },
  { step: 2, label: '납부 대상' },
  { step: 3, label: '이월 설정' },
  { step: 4, label: '계좌 공개' },
  { step: 5, label: '최종 확인' },
];

interface DuesSetupStepIndicatorProps {
  currentStep: number;
  className?: string;
}

function DuesSetupStepIndicator({ currentStep, className }: DuesSetupStepIndicatorProps) {
  return (
    <div className={cn('flex w-full items-center gap-200', className)}>
      {STEPS.map(({ step, label }) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex min-w-0 flex-1 flex-col gap-200">
            <div className="flex items-center gap-100">
              <div
                className={cn(
                  'typo-caption1 text-text-inverse flex size-4 shrink-0 items-center justify-center rounded-full',
                  isActive || isCompleted ? 'bg-container-primary' : 'bg-icon-alternative',
                )}
              >
                {isCompleted ? <Icon src={CheckIcon} alt="완료" size={14} /> : step}
              </div>
              <span
                className={cn(
                  'typo-sub3 whitespace-nowrap',
                  isActive ? 'text-brand-primary' : 'text-text-alternative',
                )}
              >
                {label}
              </span>
            </div>
            <div className="h-1 w-full rounded">
              <div
                className={cn(
                  'h-full w-full rounded',
                  isActive || isCompleted
                    ? 'bg-container-primary'
                    : 'bg-container-neutral-interaction',
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { DuesSetupStepIndicator, type DuesSetupStepIndicatorProps };
