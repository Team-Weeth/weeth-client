'use client';

import { useRef, useState } from 'react';
import type { StaticImageData } from 'next/image';
import { FolderPlusIcon, SendIcon } from '@/assets/icons';
import { FileList } from '@/components/board/FileList';
import { Button, Textarea } from '@/components/ui';
import { useFileAttach } from '@/hooks';
import { cn } from '@/lib/cn';
import type { FileItem } from '@/stores/usePostStore';

interface CommentInputProps {
  className?: string;
  placeholder?: string;
  onSubmit?: (value: string, file: FileItem | null) => void;
  disabled?: boolean;
}

function CommentInput({
  className,
  placeholder = '댓글을 입력하세요',
  onSubmit,
  disabled = false,
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');
  const { inputRef, file, open, handleChange, remove, reset } = useFileAttach();

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit?.(trimmed, file);
    setValue('');
    reset();
  };

  return (
    <div className={cn('flex flex-col gap-200', className)}>
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />

      <div className="bg-container-neutral-alternative flex items-end gap-300 rounded-lg p-300">
        <Button
          type="button"
          variant="secondary"
          size="icon-md"
          className="shrink-0"
          onClick={open}
          disabled={disabled}
          aria-label="파일 첨부"
        >
          <span className="flex h-600 w-600 items-center justify-center">
            <span
              aria-hidden
              className="bg-icon-normal block h-4 w-5 mask-contain mask-center mask-no-repeat"
              style={{
                maskImage: `url(${(FolderPlusIcon as StaticImageData).src})`,
                WebkitMaskImage: `url(${(FolderPlusIcon as StaticImageData).src})`,
              }}
            />
          </span>
        </Button>

        <Textarea
          ref={textareaRef}
          autoGrow
          clearable
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          wrapperClassName="min-h-800 min-w-0 flex-1 rounded-lg px-400 py-200"
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
          <span className="flex h-600 w-600 items-center justify-center">
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
          </span>
        </Button>
      </div>

      {file && <FileList files={[file]} editable onRemove={remove} />}
    </div>
  );
}

export { CommentInput, type CommentInputProps };
