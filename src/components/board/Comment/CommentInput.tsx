'use client';

import { useRef, useState } from 'react';
import { SendIcon } from '@/assets/icons';
import { Button, Icon, Textarea } from '@/components/ui';
import { cn } from '@/lib/cn';

interface CommentInputProps {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  onSubmit?: (value: string) => Promise<boolean> | boolean;
  onCancel?: () => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

function CommentInput({
  className,
  placeholder = '댓글을 입력하세요',
  defaultValue = '',
  onSubmit,
  onCancel,
  onValueChange,
  disabled = false,
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || !onSubmit) return;
    const ok = await onSubmit(trimmed);
    if (ok !== false) {
      handleChange('');
    }
  };

  return (
    <div className={cn('flex flex-col gap-200', className)}>
      <div className="bg-container-neutral-alternative flex items-start gap-300 rounded-lg p-300">
        <div className="min-w-0 flex-1">
          <Textarea
            ref={textareaRef}
            autoGrow
            clearable
            rows={1}
            maxLength={300}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            wrapperClassName="min-h-800 rounded-lg px-400 py-200"
          />
          <p className="typo-caption2 text-text-alternative mt-100 text-right">
            {value.length}/300
          </p>
        </div>

        {!onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="icon-md"
            className="shrink-0"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            aria-label="댓글 전송"
          >
            <Icon
              src={SendIcon}
              size={20}
              className={disabled || !value.trim() ? 'text-icon-disabled' : 'text-icon-normal'}
            />
          </Button>
        )}
      </div>

      {onCancel && (
        <div className="flex justify-end gap-200 pr-200">
          <button type="button" className="typo-button2 text-text-alternative" onClick={onCancel}>
            취소
          </button>
          <button
            type="button"
            className="typo-button2 text-brand-primary disabled:text-text-disabled"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}

export { CommentInput, type CommentInputProps };
