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
  const [focused, setFocused] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const length = Array.from(value).length;
  const exceeded = limitExceeded || length > MAX_POSITION_NAME_LENGTH;
  const showCounter = focused && length > 0;

  return (
    <div className="relative min-w-0 flex-1">
      <Input
        aria-label={label}
        aria-describedby={showCounter ? counterId : undefined}
        value={value}
        disabled={disabled}
        error={exceeded}
        placeholder="옵션을 입력해 주세요"
        className={cn(
          'typo-body1 bg-container-neutral-interaction focus:bg-container-neutral h-12 px-400',
          showCounter && 'pr-20',
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
            exceeded ? 'text-state-error' : 'text-text-alternative',
          )}
        >
          {length}/{MAX_POSITION_NAME_LENGTH}
        </span>
      )}
    </div>
  );
}

export { PositionNameInput };
