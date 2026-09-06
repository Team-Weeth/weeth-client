'use client';

import { SuffixInput } from '@/components/ui/SuffixInput';
import {
  PENALTY_SCORE_EMPTY,
  PENALTY_SCORE_MAX,
  PENALTY_SCORE_MIN,
} from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';

interface PenaltyScoreInputProps {
  /** 0이면 미입력 상태 */
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  /** 빈 문자열이면 단위 표기를 숨긴다 */
  suffix?: string;
  className?: string;
}

function PenaltyScoreInput({
  value,
  onValueChange,
  disabled = false,
  suffix = '점',
  className,
}: PenaltyScoreInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '');

    if (digits === '') {
      onValueChange(PENALTY_SCORE_EMPTY);
      return;
    }

    // 0은 미입력과 동일하게 취급한다 (제출 시 유효하지 않은 값)
    const next = Number(digits);
    onValueChange(next === 0 ? PENALTY_SCORE_EMPTY : Math.min(PENALTY_SCORE_MAX, next));
  };

  return (
    <SuffixInput
      suffix={suffix}
      stepper
      variant="neutral"
      min={PENALTY_SCORE_MIN}
      max={PENALTY_SCORE_MAX}
      value={value === PENALTY_SCORE_EMPTY ? '' : String(value)}
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

export { PenaltyScoreInput, type PenaltyScoreInputProps };
