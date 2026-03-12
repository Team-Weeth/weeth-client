'use client';

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import closeCircleIcon from '@/assets/icons/close_circle.svg';
import { cn } from '@/lib/cn';

const baseStyles = cn(
  'w-full bg-container-neutral text-text-normal typo-body2',
  'rounded-sm px-300 py-200',
  'placeholder:text-text-alternative',
  'focus:outline-none focus:border-brand-primary',
  'disabled:bg-container-neutral-alternative disabled:text-text-disabled disabled:cursor-not-allowed',
  'transition-colors',
);

const wrapperStyles = cn(
  'w-full bg-container-neutral text-text-normal typo-body2',
  'rounded-sm px-300 py-200',
  'focus-within:border-brand-primary',
  'transition-colors',
);

type DefaultProps = InputHTMLAttributes<HTMLInputElement> & {
  multiline?: false;
  clearable?: false;
  ref?: React.Ref<HTMLInputElement>;
};

type ClearableProps = InputHTMLAttributes<HTMLInputElement> & {
  multiline?: false;
  clearable: true;
  ref?: React.Ref<HTMLInputElement>;
};

type MultilineProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  multiline: true;
  clearable?: boolean;
  autoGrow?: boolean;
  rows?: number;
  ref?: React.Ref<HTMLTextAreaElement>;
};

type TextFieldProps = DefaultProps | ClearableProps | MultilineProps;

function TextField(props: TextFieldProps) {
  const { className, multiline, clearable, ...rest } = props;
  const autoGrow = multiline ? (props as MultilineProps).autoGrow : false;
  const innerRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(
    () => (props.defaultValue as string) ?? '',
  );

  const isControlled = props.value !== undefined;

  const setRef = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    (innerRef as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = el;
    const externalRef = props.ref;
    if (typeof externalRef === 'function') {
      externalRef(el as never);
    } else if (externalRef && typeof externalRef === 'object') {
      (externalRef as React.MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = el;
    }
  };

  // --- Multiline (textarea) ---
  if (multiline) {
    const { autoGrow: _, ref: __, ...textareaProps } =
      rest as TextareaHTMLAttributes<HTMLTextAreaElement> & {
        autoGrow?: boolean;
        ref?: React.Ref<HTMLTextAreaElement>;
      };

    const showClear = clearable
      ? isControlled
        ? Boolean(props.value)
        : internalValue.length > 0
      : false;

    const resizeToContent = () => {
      const el = innerRef.current as HTMLTextAreaElement | null;
      if (!el || !autoGrow) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      textareaProps.onChange?.(e);
      resizeToContent();
    };

    const handleClear = () => {
      const el = innerRef.current as HTMLTextAreaElement | null;
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

    // Multiline + clearable: wrapper with focus-within
    if (clearable) {
      return (
        <div
          className={cn(
            'flex items-end gap-200',
            wrapperStyles,
            textareaProps.disabled &&
              'bg-container-neutral-alternative text-text-disabled cursor-not-allowed',
            className,
          )}
        >
          <textarea
            ref={setRef as React.RefCallback<HTMLTextAreaElement>}
            className={cn(
              'block w-full resize-none bg-transparent p-0',
              'text-text-normal typo-body2',
              'placeholder:text-text-alternative',
              'focus:outline-none',
              'disabled:text-text-disabled disabled:cursor-not-allowed',
              autoGrow ? 'overflow-hidden' : 'scrollbar-custom overflow-y-auto',
            )}
            rows={textareaProps.rows ?? 4}
            {...textareaProps}
            onChange={handleChange}
          />
          {showClear && !textareaProps.disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-icon-normal shrink-0 cursor-pointer"
              tabIndex={-1}
              aria-label="입력 내용 지우기"
            >
              <Image src={closeCircleIcon} alt="" width={16} height={16} />
            </button>
          )}
        </div>
      );
    }

    // Multiline only: textarea directly (no wrapper)
    return (
      <textarea
        ref={setRef as React.RefCallback<HTMLTextAreaElement>}
        className={cn(
          baseStyles,
          'block resize-none',
          autoGrow ? 'overflow-hidden' : 'scrollbar-custom overflow-y-auto',
          className,
        )}
        rows={textareaProps.rows ?? 4}
        {...textareaProps}
        onChange={handleChange}
      />
    );
  }

  // --- Clearable input ---
  if (clearable) {
    const { ref: __, ...inputProps } = rest as InputHTMLAttributes<HTMLInputElement> & {
      ref?: React.Ref<HTMLInputElement>;
    };
    const showClear = isControlled
      ? Boolean(props.value)
      : internalValue.length > 0;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      inputProps.onChange?.(e);
    };

    const handleClear = () => {
      const input = innerRef.current as HTMLInputElement;
      if (!input) return;

      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set;
      setter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));

      if (!isControlled) setInternalValue('');
      input.focus();
    };

    return (
      <div className={cn('relative w-full', className)}>
        <input
          ref={setRef as React.RefCallback<HTMLInputElement>}
          className={cn(baseStyles, showClear && 'pr-9')}
          {...inputProps}
          onChange={handleChange}
        />
        {showClear && !inputProps.disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 right-200 -translate-y-1/2',
              'text-icon-alternative hover:text-icon-normal',
              'cursor-pointer transition-colors',
            )}
            tabIndex={-1}
            aria-label="입력 내용 지우기"
          >
            <Image
              src={closeCircleIcon}
              alt="텍스트 지우기 버튼"
              width={16}
              height={16}
            />
          </button>
        )}
      </div>
    );
  }

  // --- Default input ---
  const { ref: __, ...inputRest } = rest as InputHTMLAttributes<HTMLInputElement> & {
    ref?: React.Ref<HTMLInputElement>;
  };
  return (
    <input
      ref={setRef as React.RefCallback<HTMLInputElement>}
      className={cn(baseStyles, className)}
      {...inputRest}
    />
  );
}

export { TextField, type TextFieldProps };
