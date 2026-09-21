'use client';

import { useId, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { MAX_POSITION_NAME_LENGTH } from '@/constants/admin/memberPosition';
import { cn } from '@/lib/cn';

function PositionNameInput({
  value,
  onChange,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled: boolean;
}) {
  const counterId = useId();
  const errorId = useId();
  const [focused, setFocused] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const length = Array.from(value).length;
  const exceeded = limitExceeded || length > MAX_POSITION_NAME_LENGTH;
  const showCounter = focused && length > 0;
  // 포커스가 빠져 카운터가 사라져도 오류 사유는 계속 연결해 둔다.
  const describedBy =
    [showCounter && counterId, exceeded && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="relative min-w-0 flex-1">
      <Input
        aria-label={label}
        aria-describedby={describedBy}
        value={value}
        disabled={disabled}
        error={exceeded}
        placeholder="옵션을 입력해 주세요"
        className={cn(
          'typo-body1 bg-container-neutral-interaction focus:bg-container-neutral h-12 px-400',
          'max-tablet:h-10 max-tablet:px-300',
          showCounter && 'max-tablet:pr-12 pr-20',
          exceeded && 'bg-container-neutral',
        )}
        onChange={(event) => {
          const characters = Array.from(event.target.value);
          setLimitExceeded(characters.length > MAX_POSITION_NAME_LENGTH);
          onChange(characters.slice(0, MAX_POSITION_NAME_LENGTH).join(''));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showCounter && (
        <span
          id={counterId}
          className={cn(
            'typo-body1 pointer-events-none absolute top-1/2 right-400 -translate-y-1/2 tracking-[-0.07px] [--body1-weight:470]',
            'max-tablet:right-300',
            exceeded ? 'text-state-error' : 'text-text-alternative',
          )}
        >
          {length}/{MAX_POSITION_NAME_LENGTH}
        </span>
      )}
      {exceeded && (
        <span id={errorId} className="sr-only">
          옵션 이름은 최대 {MAX_POSITION_NAME_LENGTH}자까지 입력할 수 있습니다.
        </span>
      )}
    </div>
  );
}

export { PositionNameInput };
