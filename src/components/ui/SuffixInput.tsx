'use client';

import { cva, type VariantProps } from 'class-variance-authority';

import { Input, type InputProps } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

const suffixInputVariants = cva(
  cn(
    'flex h-[54px] w-full items-center gap-200 rounded-md border border-transparent px-400 py-300',
    'transition-colors focus-within:border-container-primary',
    'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-container-neutral-alternative',
  ),
  {
    variants: {
      variant: {
        neutral: 'bg-container-neutral',
        alternative: 'bg-container-neutral-alternative focus-within:bg-container-neutral',
      },
    },
    defaultVariants: {
      variant: 'alternative',
    },
  },
);

interface SuffixInputProps
  extends
    Omit<InputProps, 'clearable' | 'wrapperClassName' | 'clearButtonClassName'>,
    VariantProps<typeof suffixInputVariants> {
  /** 입력값 뒤에 붙는 단위 표기 (예: '기', '원', '점'). 빈 문자열이면 표기를 숨긴다. */
  suffix: string;
  /** 값을 `step`만큼 증감하는 스테퍼 버튼 노출 여부 */
  stepper?: boolean;
  /** 스테퍼 클릭 시 `min`/`max` 범위로 보정된 다음 값 */
  onStepChange?: (next: number) => void;
  wrapperClassName?: string;
  suffixClassName?: string;
}

function SuffixInput({
  suffix,
  stepper = false,
  onStepChange,
  variant,
  className,
  wrapperClassName,
  suffixClassName,
  min,
  max,
  step,
  ...props
}: SuffixInputProps) {
  const minValue = min === undefined ? Number.NEGATIVE_INFINITY : Number(min);
  const maxValue = max === undefined ? Number.POSITIVE_INFINITY : Number(max);
  const stepValue = step === undefined ? 1 : Number(step);
  // 빈 문자열은 0으로 취급되어 첫 증가 시 min 값이 된다.
  const numericValue = Number(props.value ?? 0) || 0;

  const handleStep = (direction: 1 | -1) => {
    const next = numericValue + stepValue * direction;
    onStepChange?.(Math.min(maxValue, Math.max(minValue, next)));
  };

  return (
    <div className={cn(suffixInputVariants({ variant }), wrapperClassName)}>
      <Input
        className={cn(
          'typo-body1 min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-left',
          'focus:border-0 disabled:bg-transparent',
          className,
        )}
        min={min}
        max={max}
        step={step}
        {...props}
      />

      {stepper && (
        <div className="bg-container-neutral-alternative flex h-[34px] w-[28px] shrink-0 flex-col items-center justify-center gap-[6px] rounded-[4px]">
          <StepperButton
            label="값 올리기"
            disabled={props.disabled || numericValue >= maxValue}
            onClick={() => handleStep(1)}
          >
            <path d="M5 0L10 6H0z" />
          </StepperButton>
          <StepperButton
            label="값 내리기"
            disabled={props.disabled || numericValue <= minValue}
            onClick={() => handleStep(-1)}
          >
            <path d="M0 0h10L5 6z" />
          </StepperButton>
        </div>
      )}

      {suffix && (
        <span
          aria-hidden
          className={cn('typo-body1 text-text-disabled shrink-0 select-none', suffixClassName)}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

function StepperButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="text-icon-alternative flex cursor-pointer items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg viewBox="0 0 10 6" fill="currentColor" aria-hidden className="h-[6px] w-[10px]">
        {children}
      </svg>
    </button>
  );
}

export { SuffixInput, suffixInputVariants, type SuffixInputProps };
