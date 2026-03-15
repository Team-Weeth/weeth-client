'use client';

import { type ChangeEvent, type TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
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

const wrapperStyles = cn(
  'flex w-full items-end gap-200',
  'bg-container-neutral text-text-normal typo-body2',
  'rounded-sm border border-transparent px-400 py-200',
  'focus-within:border-brand-primary',
  'transition-colors',
);

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  clearable?: boolean;
  autoGrow?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

function Textarea({ className, clearable, autoGrow, ref, rows = 4, ...props }: TextareaProps) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(() => (props.defaultValue as string) ?? '');

  const isControlled = props.value !== undefined;

  const setRef = (el: HTMLTextAreaElement | null) => {
    (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && typeof ref === 'object') {
      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    }
  };

  const resizeToContent = () => {
    const el = innerRef.current;
    if (!el || !autoGrow) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- resizeToContent reads autoGrow and innerRef internally
  useEffect(resizeToContent, [props.value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    props.onChange?.(e);
    resizeToContent();
  };

  const showClear = clearable
    ? isControlled
      ? Boolean(props.value)
      : internalValue.length > 0
    : false;

  const handleClear = () => {
    const el = innerRef.current;
    if (!el) return;

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set;
    setter?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));

    if (!isControlled) setInternalValue('');
    if (autoGrow) el.style.height = 'auto';
    el.focus();
  };

  if (clearable) {
    return (
      <div
        className={cn(
          wrapperStyles,
          props.disabled &&
            'bg-container-neutral-alternative text-text-disabled cursor-not-allowed',
          className,
        )}
      >
        <textarea
          ref={setRef}
          className={cn(
            'block w-full resize-none bg-transparent p-0',
            'text-text-normal typo-body2',
            'placeholder:text-text-alternative',
            'focus:outline-none',
            'disabled:text-text-disabled disabled:cursor-not-allowed',
            autoGrow ? 'overflow-hidden' : 'scrollbar-custom overflow-y-auto',
          )}
          rows={rows}
          {...props}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={handleClear}
          onMouseDown={(e) => e.preventDefault()}
          className={cn(
            'flex h-500 shrink-0 cursor-pointer items-center transition-colors',
            'text-icon-alternative hover:text-icon-normal',
            showClear && !props.disabled ? 'visible' : 'invisible',
          )}
          aria-label="입력 내용 지우기"
        >
          <Image src={closeCircleIcon} alt="" width={16} height={16} />
        </button>
      </div>
    );
  }

  return (
    <textarea
      ref={setRef}
      className={cn(
        baseStyles,
        'block resize-none',
        autoGrow ? 'overflow-hidden' : 'scrollbar-custom overflow-y-auto',
        className,
      )}
      rows={rows}
      {...props}
      onChange={handleChange}
    />
  );
}

export { Textarea, type TextareaProps };
