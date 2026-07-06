'use client';

import { cn } from '@/lib/cn';

interface DuesAmountFieldProps {
  id?: string;
  label: string;
  /** 숫자만 담긴 문자열 (예: '10000') */
  value: string;
  /** 숫자만 담긴 문자열을 넘겨준다 */
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

function DuesAmountField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder = '0',
  error,
  helperText,
  className,
}: DuesAmountFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col', className)}>
      <label htmlFor={id} className="typo-sub3 text-text-normal flex h-12 items-center px-400">
        {label}
      </label>
      <div className="flex flex-col gap-200">
        <div
          className={cn(
            'bg-container-neutral-alternative flex h-12 items-center gap-200 rounded-sm px-400',
            error && 'ring-state-error ring-1',
          )}
        >
          <input
            id={id}
            type="text"
            inputMode="numeric"
            value={value ? Number(value).toLocaleString() : ''}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
            onBlur={onBlur}
            placeholder={placeholder}
            className={cn(
              'typo-sub3 placeholder:text-text-alternative min-w-0 flex-1 bg-transparent focus:outline-none',
              value ? 'text-text-normal' : 'text-text-alternative',
            )}
          />
          <span className="typo-body1 text-text-normal shrink-0">원</span>
        </div>
        {(error || helperText) && (
          <div className="flex items-start px-400">
            {error ? (
              <span className="typo-caption2 text-state-error">{error}</span>
            ) : (
              <span className="typo-caption2 text-text-alternative">{helperText}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { DuesAmountField, type DuesAmountFieldProps };
