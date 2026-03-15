'use client';

import { type ChangeEvent, type InputHTMLAttributes, useRef, useState } from 'react';
import Image from 'next/image';
import closeCircleIcon from '@/assets/icons/close_circle.svg';
import { cn } from '@/lib/cn';

const baseStyles = cn(
  'w-full bg-container-neutral text-text-normal typo-body2',
  'rounded-sm border border-transparent px-300 py-200',
  'placeholder:text-text-alternative',
  'focus:outline-none focus:border-brand-primary',
  'disabled:bg-container-neutral-alternative disabled:text-text-disabled disabled:cursor-not-allowed',
  'transition-colors',
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  clearable?: boolean;
  wrapperClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ className, clearable, wrapperClassName, ref, ...props }: InputProps) {
  const innerRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(() => String(props.defaultValue ?? ''));

  const isControlled = props.value !== undefined;

  const setRef = (el: HTMLInputElement | null) => {
    (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && typeof ref === 'object') {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    }
  };

  if (!clearable) {
    return <input ref={setRef} className={cn(baseStyles, className)} {...props} />;
  }

  const showClear = isControlled
    ? String(props.value).length > 0
    : internalValue.length > 0;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    props.onChange?.(e);
  };

  const handleClear = () => {
    const input = innerRef.current;
    if (!input) return;

    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));

    if (!isControlled) setInternalValue('');
    input.focus();
  };

  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <input
        ref={setRef}
        className={cn(baseStyles, showClear && 'pr-9', className)}
        {...props}
        onChange={handleChange}
      />
      {showClear && !props.disabled && (
        <button
          type="button"
          onClick={handleClear}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'absolute top-1/2 right-200 -translate-y-1/2',
            'text-icon-alternative hover:text-icon-normal',
            'cursor-pointer transition-colors',
          )}
          aria-label="입력 내용 지우기"
        >
          <Image src={closeCircleIcon} alt="텍스트 지우기 버튼" width={16} height={16} />
        </button>
      )}
    </div>
  );
}

export { Input, type InputProps };
