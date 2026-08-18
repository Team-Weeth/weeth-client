'use client';

import { SuffixInput } from '@/components/ui';
import { PENALTY_SCORE_MAX, PENALTY_SCORE_MIN } from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';

/** 입력값이 비어 있는 상태를 나타내는 값 (제출 시 유효하지 않은 점수) */
const EMPTY_SCORE = 0;

interface PenaltyScoreInputProps {
  /** 0이면 미입력 상태 */
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

function PenaltyScoreInput({
  value,
  onValueChange,
  disabled = false,
  className,
}: PenaltyScoreInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '');

    if (digits === '') {
      onValueChange(EMPTY_SCORE);
      return;
    }

    const next = Number(digits);
    if (next > 0) onValueChange(Math.min(PENALTY_SCORE_MAX, next));
  };

  return (
    <SuffixInput
      suffix="점"
      stepper
      variant="neutral"
      min={PENALTY_SCORE_MIN}
      max={PENALTY_SCORE_MAX}
      value={value === EMPTY_SCORE ? '' : String(value)}
      onChange={handleChange}
      onStepChange={onValueChange}
      disabled={disabled}
      type="text"
      inputMode="numeric"
      aria-label="페널티 점수"
      className="typo-sub3 text-text-strong"
      wrapperClassName={cn('h-12', className)}
      suffixClassName="text-text-normal"
    />
  );
}

export { PenaltyScoreInput, EMPTY_SCORE, type PenaltyScoreInputProps };
