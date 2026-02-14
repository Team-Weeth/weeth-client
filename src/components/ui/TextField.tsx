'use client';

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  forwardRef,
  useImperativeHandle,
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

type DefaultProps = InputHTMLAttributes<HTMLInputElement> & {
  multiline?: false;
  clearable?: false;
};

type ClearableProps = InputHTMLAttributes<HTMLInputElement> & {
  multiline?: false;
  clearable: true;
};

type MultilineProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  multiline: true;
  clearable?: false;
  rows?: number;
};

type TextFieldProps = DefaultProps | ClearableProps | MultilineProps;

const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  (props, outerRef) => {
    const { className, multiline, clearable, ...rest } = props;
    const innerRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [internalValue, setInternalValue] = useState(() => (props.defaultValue as string) ?? '');

    useImperativeHandle(outerRef, () => innerRef.current!);

    const isControlled = props.value !== undefined;

    // --- Multiline (scrollable textarea) ---
    if (multiline) {
      const textareaProps = rest as TextareaHTMLAttributes<HTMLTextAreaElement>;
      return (
        <textarea
          ref={innerRef as React.RefObject<HTMLTextAreaElement>}
          className={cn(baseStyles, 'scrollbar-custom resize-none overflow-y-auto', className)}
          rows={textareaProps.rows ?? 4}
          {...textareaProps}
        />
      );
    }

    // --- Clearable input ---
    if (clearable) {
      const inputProps = rest as InputHTMLAttributes<HTMLInputElement>;
      const showClear = isControlled ? Boolean(props.value) : internalValue.length > 0;

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
        <div className="relative w-full">
          <input
            ref={innerRef as React.RefObject<HTMLInputElement>}
            className={cn(baseStyles, showClear && 'pr-9', className)}
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
              <Image src={closeCircleIcon} alt="텍스트 지우기 버튼" width={16} height={16} />
            </button>
          )}
        </div>
      );
    }

    // --- Default input ---
    return (
      <input
        ref={innerRef as React.RefObject<HTMLInputElement>}
        className={cn(baseStyles, className)}
        {...(rest as InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  },
);

TextField.displayName = 'TextField';

export { TextField, type TextFieldProps };
