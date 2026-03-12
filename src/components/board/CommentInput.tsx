'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';
import { FolderPlusIcon, SendIcon } from '@/assets/icons';
import { Button, TextField } from '@/components/ui';
import { cn } from '@/lib/cn';

interface CommentInputProps {
  className?: string;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
}

function CommentInput({
  className,
  placeholder = '댓글을 입력하세요',
  onSubmit,
  onAttach,
  disabled = false,
}: CommentInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('bg-container-neutral-alternative rounded-lg p-300', className)}>
      <div className="flex items-end gap-300">
        <Button
          type="button"
          variant="secondary"
          size="icon-md"
          className="shrink-0"
          onClick={onAttach}
          disabled={disabled}
          aria-label="파일 첨부"
        >
          <Image src={FolderPlusIcon} alt="" width={20} height={16} className="text-icon-normal" />
        </Button>

        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-lg px-400"
        />

        <Button
          type="button"
          variant="secondary"
          size="icon-md"
          className="shrink-0"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="댓글 전송"
        >
          <span
            aria-hidden
            className={cn(
              'block h-4 w-5 mask-contain mask-center mask-no-repeat',
              disabled || !value.trim() ? 'bg-icon-disabled' : 'bg-icon-normal',
            )}
            style={{
              maskImage: `url(${(SendIcon as StaticImageData).src})`,
              WebkitMaskImage: `url(${(SendIcon as StaticImageData).src})`,
            }}
          />
        </Button>
      </div>
    </div>
  );
}

export { CommentInput, type CommentInputProps };
