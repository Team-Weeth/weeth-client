'use client';

import { useRef } from 'react';

import { cn } from '@/lib/cn';

/** 숫자가 아닌 문자 제거용 정규식 (모듈 레벨 호이스팅) */
const NON_DIGIT = /\D/g;

interface InputOTPProps {
  /** 입력 칸 개수 (기본값: 6) */
  length?: number;
  /** 현재 입력된 코드 문자열 */
  value: string;
  /** 코드 변경 시 호출되는 콜백 */
  onChange: (value: string) => void;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * OTP(일회용 코드) 입력 컴포넌트
 *
 * - 각 칸에 숫자 1자리씩 입력
 * - 자동 포커스 이동 (입력 시 다음 칸, Backspace 시 이전 칸)
 * - 화살표 키로 칸 이동
 * - 붙여넣기 지원
 */
function InputOTP({ length = 6, value, onChange, className, ref }: InputOTPProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 단일 패스로 digits 배열 생성 (split + concat + slice 대체)
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  function focusAt(index: number) {
    inputRefs.current[index]?.focus();
  }

  /** 특정 인덱스의 값을 교체한 새 코드를 onChange로 전달 */
  function updateDigitAt(index: number, digit: string) {
    const next = digits.with(index, digit);
    onChange(next.join(''));
  }

  /** 숫자만 허용하고, 입력 후 다음 칸으로 포커스 이동 */
  function handleInputChange(index: number, inputValue: string) {
    const digit = inputValue.replace(NON_DIGIT, '').slice(-1);
    if (!digit) return;

    updateDigitAt(index, digit);

    if (index < length - 1) {
      focusAt(index + 1);
    }
  }

  /** Backspace: 현재 칸 삭제 또는 이전 칸으로 이동, 화살표 키: 칸 이동 */
  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        updateDigitAt(index, '');
      } else if (index > 0) {
        updateDigitAt(index - 1, '');
        focusAt(index - 1);
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1);
      return;
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      focusAt(index + 1);
    }
  }

  /** 클립보드에서 숫자만 추출하여 한 번에 입력 */
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(NON_DIGIT, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    focusAt(Math.min(pasted.length, length - 1));
  }

  return (
    <div ref={ref} className={cn('flex items-start justify-center gap-200 self-stretch', className)}>
      {digits.map((digit, index) => (
        <div key={index} className="flex w-[41px] flex-col items-start gap-200">
          <input
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className="bg-container-neutral text-text-strong typo-body1 focus:border-brand-secondary flex w-full items-center self-stretch rounded-lg border-1 border-transparent px-200 py-300 text-center outline-none"
            autoComplete="one-time-code"
          />
        </div>
      ))}
    </div>
  );
}

export { InputOTP, type InputOTPProps };
